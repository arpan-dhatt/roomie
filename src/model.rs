use actix_web::{HttpRequest, HttpResponse, Responder};
use futures::future::{ready, Ready};
use meilisearch_sdk::document::Document;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Debug)]
pub struct AuthRequest {
    pub oauth_token_id: String,
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

#[derive(Deserialize, Debug)]
pub struct GetStudentRequest {
    pub token: String,
    pub class: Option<usize>,
    pub college: Option<String>,
    pub major: Option<String>,
    pub gender: Option<String>,
    pub location: Option<String>,
    pub query: Option<String>,
    pub offset: Option<usize>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Profile {
    pub sub: String,
    pub first_name: String,
    pub last_name: String,
    pub gender: String,
    pub class: usize,
    pub college: String,
    pub major: String,
    pub bio: String,
    pub discord: String,
    pub linkedin: String,
    pub snapchat: String,
    pub instagram: String,
    pub facebook: String,
    pub twitter: String,
    pub email: String,
    pub phone: String,
    pub location: String,
    pub building_preferences: String,
}

impl Default for Profile {
    fn default() -> Self {
        Profile {
            sub: "".to_string(),
            first_name: "".to_string(),
            last_name: "".to_string(),
            gender: "".to_string(),
            class: 2025,
            college: "".to_string(),
            major: "".to_string(),
            bio: "".to_string(),
            discord: "".to_string(),
            linkedin: "".to_string(),
            snapchat: "".to_string(),
            instagram: "".to_string(),
            facebook: "".to_string(),
            twitter: "".to_string(),
            email: "".to_string(),
            phone: "".to_string(),
            location: "".to_string(),
            building_preferences: "".to_string(),
        }
    }
}

impl Document for Profile {
    type UIDType = String;
    fn get_uid(&self) -> &Self::UIDType {
        &self.sub
    }
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
    pub cont2: String,
}
