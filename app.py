from flask import Flask, jsonify, request
from flask_migrate import Migrate
from model import db, TripStatusEnum, TokenBlocklist
from datetime import datetime
from flask_jwt_extended import JWTManager
from datetime import timedelta
from flask_jwt_extended import create_access_token
app = Flask(__name__)

# migration initialization
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///travel.db'
migrate = Migrate(app, db)
db.init_app(app)

# jwt
app.config["JWT_SECRET_KEY"] = "asdddtfyggjj"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] =  timedelta(hours=1)

jwt = JWTManager(app)
jwt.init_app(app)


# imports functions from views
from views import *

app.register_blueprint(user_bp)
app.register_blueprint(trip_bp )
app.register_blueprint(activity_bp)
app.register_blueprint(auth_bp)


@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload: dict) -> bool:
    jti = jwt_payload["jti"]
    token = db.session.query(TokenBlocklist.id).filter_by(jti=jti).scalar()

    return token is not None



if __name__ == '__main__':
    app.run(debug=True)