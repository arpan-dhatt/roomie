use actix_web::{HttpRequest, HttpResponse, Responder};
use futures::future::{Ready, ready};
use serde::{Serialize, Deserialize};

#[derive(Deserialize, Debug)]
pub struct AuthRequest {
    pub oauth_token_id: String
}

#[derive(Serialize, Debug)]
pub enum AuthResponse {
    jwt_token(String),
    error(String)
}

impl Responder for AuthResponse {
    type Error = actix_web::Error;
    type Future = Ready<Result<HttpResponse, actix_web::Error>>;

    fn respond_to(self, _req: &HttpRequest) -> Self::Future {
        let body = serde_json::to_string(&self).unwrap();

        ready(Ok(HttpResponse::Ok().content_type("application.json").body(body)))
    }
}

#[derive(Deserialize, Debug)]
pub enum InternalOAuthResult {
    content { sub: String },
    error (String)
}

#[derive(Deserialize, Debug)]
pub struct JWTAuth {
    pub token: String
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Profile {
    pub first_name: String,
    pub last_name: String,
    pub college_name: String,
    pub discord: String,
    pub linkedin: String,
    pub snapchat: String,
    pub instagram: String,
    pub facebook: String,
    pub twitter: String,
    pub email: String,
    pub phone: String,
    pub honors: Vec<String>,
    pub location: Vec<String>,
    pub floorplan: Vec<String>,
    pub additional: String
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DBProfileEntry {
    pub sub: String,
    pub profile: Profile
}

#[derive(Serialize, Debug)]
pub struct GetStudentsResponse {
    pub current_student: Profile,
    pub students: Vec<Profile>
}
