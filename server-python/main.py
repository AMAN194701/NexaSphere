from fastapi import FastAPI
from slowapi.middleware import SlowAPIMiddleware

from routers.membership import router, limiter

app = FastAPI()

app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

app.include_router(router)