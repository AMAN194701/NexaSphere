import importlib
import sys
from pathlib import Path

SERVER_PYTHON_ROOT = Path(__file__).resolve().parents[1]
if str(SERVER_PYTHON_ROOT) not in sys.path:
    sys.path.insert(0, str(SERVER_PYTHON_ROOT))


def test_certificate_ids_are_random_and_well_formed(monkeypatch):
    monkeypatch.setenv("ADMIN_SECRET", "test-admin-secret")

    certificates = importlib.import_module("routers.certificates")

    tokens = iter(["a" * 32, "b" * 32])
    monkeypatch.setattr(certificates.secrets, "token_hex", lambda n: next(tokens))

    first = certificates._make_certificate_id("student-1", "event-1")
    second = certificates._make_certificate_id("student-1", "event-1")

    assert first == "NS-CERT-" + "A" * 32
    assert second == "NS-CERT-" + "B" * 32
    assert first != second
    assert len(first) <= 60
    assert len(second) <= 60
