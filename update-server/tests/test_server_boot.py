"""
This is the most critical test package for this application--this server MUST
be able to boot. If a version that fails to boot is installed, then the robot
will almost certainly become unrecoverable.
"""
from ot2update import get_app


async def test_server_boot(loop, test_client):
    app = get_app(loop)
    cli = await loop.create_task(test_client(app))
