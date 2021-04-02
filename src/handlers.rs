use crate::model::{AuthRequest, AuthResponse, JWTAuth};
use crate::{
    auth::{get_sub, new_token, validate_token},
    model::{DBProfileEntry, GetStudentsResponse, Profile},
};
use actix_files::NamedFile;
use actix_web::{get, post, web, HttpResponse, Responder};
use bson::doc;
use futures::StreamExt;
use mongodb::{options::ReplaceOptions, Client};

#[get("/student")]
pub async fn get_student(
    web::Query(jwt_auth): web::Query<JWTAuth>,
    db_client: web::Data<Client>,
) -> impl Responder {
    if let Ok(sub) = validate_token(&jwt_auth.token) {
        let mut cursor = db_client
            .database("roomie")
            .collection("students")
            .find(doc! {}, None)
            .await
            .expect("failed to get Documents");
        let mut all_students = vec![];
        let mut current_student = None;
        while let Some(result) = cursor.next().await {
            match result {
                Ok(document) => {
                    if let Ok(entry) = bson::from_document::<DBProfileEntry>(document) {
                        all_students.push(entry.profile.clone());
                        if &entry.sub == &sub {
                            current_student = Some(entry.profile.clone());
                        }
                    }
                }
                Err(e) => {
                    println!("{:?}", e);
                }
            }
        }
        HttpResponse::Ok().body(
            serde_json::to_string(&GetStudentsResponse{ current_student: current_student.unwrap(), students: all_students}).expect("could not serialize students to json"),
        )
    } else {
        HttpResponse::Forbidden().body("")
    }
}

#[post("/student")]
pub async fn post_student(
    web::Query(jwt_auth): web::Query<JWTAuth>,
    web::Json(student_profile): web::Json<Profile>,
    db_client: web::Data<Client>,
) -> impl Responder {
    if let Ok(sub) = validate_token(&jwt_auth.token) {
        let new_doc = DBProfileEntry {
            sub: sub.clone(),
            profile: student_profile,
        };
        let new_doc =
            bson::to_bson(&new_doc).expect("must be able to serialize student profile into BSON");
        let new_doc = new_doc.as_document().unwrap();
        let mut options = ReplaceOptions::default();
        options.upsert = Some(true);
        db_client
            .database("roomie")
            .collection("students")
            .replace_one(doc! {"sub": sub }, new_doc.to_owned(), options)
            .await
            .expect("upsert failed");
        HttpResponse::Ok()
    } else {
        HttpResponse::Forbidden()
    }
}

#[post("/auth")]
pub async fn auth_user(auth_request: web::Json<AuthRequest>) -> impl Responder {
    let sub = get_sub(&auth_request.oauth_token_id).await;
    match sub {
        Ok(sub) => match new_token(&sub) {
            Ok(token) => AuthResponse::jwt_token(token),
            Err(e) => AuthResponse::error(e.to_string()),
        },
        Err(e) => AuthResponse::error(e.to_string()),
    }
}

#[get("/")]
pub async fn index() -> impl Responder {
    NamedFile::open("./web-app/public/index.html")
}
