import pytest
from pathlib import Path
from app.core.storage import StorageManager

def test_storage_manager_lifecycle(tmp_path: Path):
    sm = StorageManager(base_temp_dir=tmp_path)
    session_id, session_path = sm.create_session_dir()
    
    assert session_path.exists()
    assert session_path.is_dir()
    assert sm.get_session_dir(session_id) == session_path
    
    test_file = session_path / "test.txt"
    test_file.write_text("hello world")
    assert test_file.exists()
    
    cleaned = sm.cleanup_session_dir(session_id)
    assert cleaned is True
    assert not session_path.exists()
