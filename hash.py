from passlib.context import CryptContext

pw_cxt = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Hash:
    @staticmethod
    def hash_func(pw: str):
        return pw_cxt.hash(pw)
    
    @staticmethod
    def verify_hash(pw: str, hashed_pw: str):
        return pw_cxt.verify(pw, hash=hashed_pw)
    