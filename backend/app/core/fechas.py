from datetime import datetime, timedelta, timezone


def ahora_utc() -> datetime:
    """Fecha y hora actual en UTC. Todas las fechas se guardan en UTC."""
    return datetime.now(timezone.utc)


# Argentina no usa horario de verano: UTC-3 fijo. Se evita zoneinfo porque en
# Windows necesita instalar el paquete tzdata.
ZONA_ARGENTINA = timezone(timedelta(hours=-3), "ART")


def rango_de_hoy_utc() -> tuple[datetime, datetime]:
    """Inicio y fin (exclusivo) del día de hoy en Argentina, expresados en UTC."""
    ahora_local = datetime.now(ZONA_ARGENTINA)
    inicio_local = ahora_local.replace(hour=0, minute=0, second=0, microsecond=0)
    inicio = inicio_local.astimezone(timezone.utc)
    return inicio, inicio + timedelta(days=1)
