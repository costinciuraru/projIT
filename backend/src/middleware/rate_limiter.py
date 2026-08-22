from slowapi import Limiter
from slowapi.util import get_remote_address

# Keyed by IP (not user id) — simpler and doesn't require decoding the JWT inside
# slowapi's synchronous key function. Good enough to blunt abuse of the paid endpoints.
limiter = Limiter(key_func=get_remote_address)
