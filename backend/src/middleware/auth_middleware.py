from fastapi import Header

# TODO(Prompt 5): replace with real verification of the Supabase JWT
# (Authorization: Bearer <token> -> supabase.auth.get_user(token)). For now this
# just trusts a plain header so routes can be built end-to-end before auth exists.


def get_current_user_id(x_user_id: str = Header(..., alias="X-User-Id")) -> str:
    return x_user_id
