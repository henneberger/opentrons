import os
import json
import logging
from aiohttp import web
from pprint import pprint

log = logging.getLogger(__name__)

# package.json location for the update server
update_package = os.path.join(
    os.path.abspath(os.path.dirname(__file__)), 'package.json')

# package.json location for the API server installed in the update server's
# environment (e.g.: which version is available by import). This is one way of
# finding this info, but it could also be determined by making an HTTP request
# to the API server and selecting this info. In the future, this server should
# check the health of the API server process and possibly get the version that
# way instead.
try:
    import opentrons
    api_package = os.path.join(
        os.path.abspath(os.path.dirname(opentrons.__file__)), 'package.json')
except (ImportError, ModuleNotFoundError):
    rpi_site_packages = '/data/packages/usr/local/lib/python3.6/site-packages'
    api_package = os.path.join(rpi_site_packages, 'opentrons', 'package.json')


def get_version(path) -> str:
    """
    Reads the version field from a package file

    :param path: the path to a valid package.json file
    :return: the version string or "unknown"
    """
    log.info("Loading package json from: {}".format(path))

    if os.path.exists(path):
        with open(path) as pkg:
            package_dict = json.load(pkg)
            version = package_dict.get('version')
    else:
        log.warning("No package json found at {}".format(path))
        version = 'unknown'
    return version


# this naming logic is copied from compute/scripts/anounce_mdns.py
device_name = 'opentrons-{}'.format(
    os.environ.get('RESIN_DEVICE_NAME_AT_INIT', 'dev'))


async def health(request):
    return web.json_response(
        {
            'name': device_name,
            'updateServerVersion': get_version(update_package),
            'apiServerVersion': get_version(api_package)
        },
        headers={'Access-Control-Allow-Origin': '*'}
    )
