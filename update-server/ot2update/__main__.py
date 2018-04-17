import os
import json
import logging
from aiohttp import web
from ot2update import endpoints

SETTINGS_FILE = '/mnt/usbdrive/config/update-server/update-server-config.json'


def get_app_config() -> dict:
    if os.path.exists(SETTINGS_FILE):
        with open(SETTINGS_FILE) as cfg_f:
            config = json.load(cfg_f)
    else:
        config = {}
    return config


def get_logging_config(config: dict) -> dict:
    if config and "logging" in config.keys():
        logging_config = config.get("logging")
    else:
        logging_config = {
            'format': '%(asctime)s %(name)s %(levelname)s [Line %(lineno)s] %(message)s',  # noqa
            'level': 'INFO'
        }
    return logging_config


def get_app(loop=None) -> web.Application:
    app = web.Application(loop=loop)
    app.router.add_routes([
        web.get('/server/update/health', endpoints.health)
    ])
    return app


def main():
    config = get_app_config()
    logging.basicConfig(**get_logging_config(config))
    log = logging.getLogger(__file__)

    port = os.environ.get('OT_UPDATE_PORT', 34000)
    log.info('Starting update server on localhost:{}'.format(port))
    web.run_app(get_app(), port=port)


main()
