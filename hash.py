import bcrypt

class Hash:
    @staticmethod
    def hash_func(pw: str) -> str:
        pwd_bytes = pw.encode("utf-8")
        salt = bcrypt.gensalt() # random value
        return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")
    
    @staticmethod
    def verify_hash(plain_pw: str, hashed_pw:str) -> bool:
        return bcrypt.checkpw(plain_pw.encode("utf-8"), 
                              hashed_password=hashed_pw.encode("utf-8"))

# the one below only works for ubuntu systems
# from passlib.context import CryptContext

# pw_cxt = CryptContext(schemes=["bcrypt"], deprecated="auto")

# class Hash:
#     @staticmethod
#     def hash_func(pw: str):
#         return pw_cxt.hash(pw)
    
#     @staticmethod
#     def verify_hash(pw: str, hashed_pw: str):
#         return pw_cxt.verify(pw, hash=hashed_pw)
    