from datetime import datetime, timezone


def ahora_utc() -> datetime:
    """Fecha y hora actual en UTC. Todas las fechas se guardan en UTC."""
    return datetime.now(timezone.utc)
