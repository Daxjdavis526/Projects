"""JSON round-trip for the simulation definition.

Writing is canonical: SI values, sorted keys, Python's shortest round-trip
float repr. The same definition always serialises to the same bytes, and
:func:`definition_hash` of those bytes identifies it in run manifests.

Reading is forgiving about units and strict about everything else: unknown
keys, missing required values and unknown union tags are errors, never
silently ignored.
"""

from __future__ import annotations

import dataclasses
import enum
import hashlib
import json
import types
import typing
from pathlib import Path

from ..units import quantity_to_si
from .definition import SCHEMA_VERSION, SimulationDefinition


class DefinitionError(ValueError):
    """The JSON does not describe a valid simulation definition."""


def to_dict(obj: object) -> object:
    if dataclasses.is_dataclass(obj):
        out: dict[str, object] = {}
        tag = getattr(type(obj), "TAG", None)
        if tag is not None:
            out["type"] = tag
        for f in dataclasses.fields(obj):
            out[f.name] = to_dict(getattr(obj, f.name))
        return out
    if isinstance(obj, enum.Enum):
        return obj.value
    if isinstance(obj, (list, tuple)):
        return [to_dict(v) for v in obj]
    return obj


def dumps(defn: SimulationDefinition) -> str:
    return json.dumps(to_dict(defn), sort_keys=True, indent=2, ensure_ascii=False) + "\n"


def definition_hash(defn: SimulationDefinition) -> str:
    canonical = json.dumps(to_dict(defn), sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def _union_members(tp: object) -> tuple[type, ...] | None:
    if isinstance(tp, types.UnionType) or typing.get_origin(tp) is typing.Union:
        return tuple(a for a in typing.get_args(tp) if a is not type(None))
    return None


def _build(tp: object, raw: object, path: str) -> object:
    members = _union_members(tp)
    if members is not None:
        if raw is None and type(None) in typing.get_args(tp):
            return None
        tagged = [m for m in members if dataclasses.is_dataclass(m) and hasattr(m, "TAG")]
        if tagged:
            if not isinstance(raw, dict) or "type" not in raw:
                tags = ", ".join(m.TAG for m in tagged)
                raise DefinitionError(f"{path}: needs a 'type' key, one of: {tags}")
            for m in tagged:
                if m.TAG == raw["type"]:
                    return _build(m, {k: v for k, v in raw.items() if k != "type"}, path)
            tags = ", ".join(m.TAG for m in tagged)
            raise DefinitionError(f"{path}: unknown type {raw['type']!r}; expected one of: {tags}")
        plain = [m for m in members if dataclasses.is_dataclass(m)]
        if len(members) == 1 and plain:  # an optional block such as Tolerances | None
            return _build(plain[0], raw, path)
        for m in members:  # plain unions such as float | None
            try:
                return _build(m, raw, path)
            except (DefinitionError, TypeError, ValueError):
                continue
        raise DefinitionError(f"{path}: {raw!r} does not match {tp}")

    if dataclasses.is_dataclass(tp):
        if not isinstance(raw, dict):
            raise DefinitionError(f"{path}: expected an object, got {raw!r}")
        raw = {k: v for k, v in raw.items() if not (k == "type" and hasattr(tp, "TAG"))}
        hints = typing.get_type_hints(tp)
        names = {f.name for f in dataclasses.fields(tp)}
        unknown = set(raw) - names
        if unknown:
            raise DefinitionError(f"{path}: unknown keys {sorted(unknown)}")
        kwargs = {}
        for f in dataclasses.fields(tp):
            if f.name not in raw:
                if f.default is dataclasses.MISSING and f.default_factory is dataclasses.MISSING:
                    raise DefinitionError(f"{path}.{f.name}: required")
                continue
            sub = f"{path}.{f.name}"
            dim = f.metadata.get("dim")
            if dim is not None:
                try:
                    kwargs[f.name] = quantity_to_si(raw[f.name], dim)
                except ValueError as e:
                    raise DefinitionError(f"{sub}: {e}") from None
            else:
                kwargs[f.name] = _build(hints[f.name], raw[f.name], sub)
        try:
            return tp(**kwargs)
        except (TypeError, ValueError) as e:
            raise DefinitionError(f"{path}: {e}") from None

    if isinstance(tp, type) and issubclass(tp, enum.Enum):
        try:
            return tp(raw)
        except ValueError:
            allowed = ", ".join(repr(m.value) for m in tp)
            raise DefinitionError(f"{path}: {raw!r} is not one of {allowed}") from None
    if typing.get_origin(tp) is tuple:
        args = typing.get_args(tp)
        if not isinstance(raw, (list, tuple)):
            raise DefinitionError(f"{path}: expected a list, got {raw!r}")
        if len(args) == 2 and args[1] is Ellipsis:
            return tuple(_build(args[0], v, f"{path}[{i}]") for i, v in enumerate(raw))
        if len(raw) != len(args):
            raise DefinitionError(f"{path}: expected {len(args)} values, got {len(raw)}")
        return tuple(_build(a, v, f"{path}[{i}]") for i, (a, v) in enumerate(zip(args, raw)))
    if tp is bool:
        if not isinstance(raw, bool):
            raise DefinitionError(f"{path}: expected true or false, got {raw!r}")
        return raw
    if tp is float:
        if isinstance(raw, bool) or not isinstance(raw, (int, float)):
            raise DefinitionError(f"{path}: expected a number, got {raw!r}")
        return float(raw)
    if tp is int:
        if isinstance(raw, bool) or not isinstance(raw, int):
            raise DefinitionError(f"{path}: expected an integer, got {raw!r}")
        return raw
    if tp is str:
        if not isinstance(raw, str):
            raise DefinitionError(f"{path}: expected a string, got {raw!r}")
        return raw
    raise DefinitionError(f"{path}: unsupported field type {tp}")


def from_dict(data: object) -> SimulationDefinition:
    if not isinstance(data, dict):
        raise DefinitionError("a simulation definition must be a JSON object")
    version = data.get("schema_version", SCHEMA_VERSION)
    if version != SCHEMA_VERSION:
        raise DefinitionError(
            f"schema_version {version} is not supported (this build reads {SCHEMA_VERSION})"
        )
    return _build(SimulationDefinition, data, "definition")


def loads(text: str) -> SimulationDefinition:
    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        raise DefinitionError(f"not valid JSON: {e}") from None
    return from_dict(data)


def load(path: str | Path) -> SimulationDefinition:
    return loads(Path(path).read_text(encoding="utf-8"))


def save(defn: SimulationDefinition, path: str | Path) -> None:
    Path(path).write_text(dumps(defn), encoding="utf-8", newline="\n")
