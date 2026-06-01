"""Allow `python -m backend` to launch the server."""

import uvicorn

from . import config


def main() -> None:
    uvicorn.run(
        "backend.app:app",
        host=config.HOST,
        port=config.PORT,
        reload=False,
    )


if __name__ == "__main__":
    main()
