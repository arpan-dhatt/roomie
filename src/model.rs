use actix_web::{HttpRequest, HttpResponse, Responder};
use futures::future::{ready, Ready};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Debug)]
pub struct AuthRequest {
    pub oauth_token_id: String,
    pub eid: String
}

#[derive(Serialize, Debug)]
pub enum AuthResponse {
    #[serde(rename = "jwt_token")]
    JwtToken(String),
    #[serde(rename = "error")]
    Error(String),
}

impl Responder for AuthResponse {
    type Error = actix_web::Error;
    type Future = Ready<Result<HttpResponse, actix_web::Error>>;

    fn respond_to(self, _req: &HttpRequest) -> Self::Future {
        let body = serde_json::to_string(&self).unwrap();

        ready(Ok(HttpResponse::Ok()
            .content_type("application.json")
            .body(body)))
    }
}

#[derive(Deserialize, Debug)]
pub enum InternalOAuthResult {
    #[serde(rename = "content")]
    Content { sub: String },
    #[serde(rename = "error")]
    Error(String),
}

#[derive(Deserialize, Debug)]
pub struct JWTAuth {
    pub token: String,
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
    pub additional: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DBProfileEntry {
    pub sub: String,
    pub profile: Profile,
}

#[derive(Serialize, Debug)]
pub struct GetStudentsResponse {
    pub current_student: Profile,
    pub students: Vec<Profile>,
}

#[derive(Serialize, Debug)]
pub struct BackendEIDFormData {
    #[serde(rename = "qwicap-page-id")]
    pub page_id: String,
    #[serde(rename = "qwicap-form-id")]
    pub form_id: String,
    pub eid: String,
    #[serde(rename = "continue")]
    pub cont1: String,
    #[serde(rename = "continue")]
    pub cont2: String
}
