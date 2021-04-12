use crate::model::{AuthRequest, AuthResponse, GetStudentRequest, JWTAuth};
use crate::{
    auth::{get_sub, new_token, validate_token},
    model::{GetStudentsResponse, Profile},
};
use actix_multipart::Multipart;
use actix_web::{get, post, web, HttpResponse, Responder};
use futures::{StreamExt, TryStreamExt};
use std::io::Write;

fn create_filter(data: &GetStudentRequest) -> String {
    let mut out_string = String::new();
    if let Some(year) = &data.class {
        add_filter_equal(&mut out_string, "year", *year, false)
    }
    if let Some(college) = &data.college {
        add_filter_equal(&mut out_string, "college", college, true)
    }
    if let Some(major) = &data.major {
        add_filter_equal(&mut out_string, "major", major, true)
    }
    if let Some(gender) = &data.gender {
        add_filter_equal(&mut out_string, "gender", gender, true)
    }
    if let Some(location) = &data.location {
        add_filter_equal(&mut out_string, "location", location, true)
    }
    if out_string.ends_with(" AND ") {
        out_string.replace_range((out_string.len() - 5)..out_string.len(), "");
    }
    out_string
}

fn add_filter_equal(start: &mut String, key: &str, value: impl std::fmt::Display, quotes: bool) {
    start.push_str(&match quotes {
        true => format!("{} = \"{}\" AND ", key, value),
        false => format!("{} = {} AND ", key, value),
    });
}

#[get("/student")]
pub async fn get_student(
    web::Query(data): web::Query<GetStudentRequest>,
    client: web::Data<meilisearch_sdk::client::Client<'_>>,
) -> impl Responder {
    if let Ok(sub) = validate_token(&data.token) {
        let filter = create_filter(&data);
        let index = client.get_or_create("students").await.unwrap();
        let mut builder = index.search();
        let mut builder = builder
            .with_filters(&filter)
            .with_limit(12)
            .with_offset(data.offset.unwrap_or(0));
        if let Some(query) = &data.query {
            builder = builder.with_query(&query);
        }
        let result = builder.execute::<Profile>().await;
        if let Ok(result) = result {
            let mut current_student = None;
            let mut all_students = vec![];
            for item in result.hits {
                if &item.result.sub == &sub {
                    current_student = Some(item.result);
                } else {
                    all_students.push(item.result);
                }
            }
            HttpResponse::Ok().body(
                serde_json::to_string(&GetStudentsResponse {
                    current_student: current_student.unwrap_or_default(),
                    students: all_students,
                })
                .expect("could not serialize students to json"),
            )
        } else {
            println!("{}", filter);
            HttpResponse::Ok().body(
                serde_json::to_string(&GetStudentsResponse {
                    current_student: Profile::default(),
                    students: vec![],
                })
                .unwrap(),
            )
        }

    //      let mut cursor = db_client
    //          .database("roomie")
    //          .collection("students")
    //          .find(doc! {}, None)
    //          .await
    //          .expect("failed to get Documents");
    //      let mut all_students = vec![];
    //      let mut current_student = None;
    //      while let Some(result) = cursor.next().await {
    //          match result {
    //              Ok(document) => {
    //                  if let Ok(entry) = bson::from_document::<DBProfileEntry>(document) {
    //                      all_students.push(entry.profile.clone());
    //                      if &entry.sub == &sub {
    //                          current_student = Some(entry.profile.clone());
    //                      }
    //                  }
    //              }
    //              Err(e) => {
    //                  println!("{:?}", e);
    //              }
    //          }
    //      }
    //      HttpResponse::Ok().body(
    //          serde_json::to_string(&GetStudentsResponse {
    //              current_student: current_student.unwrap_or_default(),
    //              students: all_students,
    //          })
    //          .expect("could not serialize students to json"),
    //      )
    } else {
        HttpResponse::Forbidden().body("")
    }
}

#[post("/student")]
pub async fn post_student(
    web::Query(jwt_auth): web::Query<JWTAuth>,
    web::Json(mut student_profile): web::Json<Profile>,
    client: web::Data<meilisearch_sdk::client::Client<'_>>,
) -> impl Responder {
    if let Ok(sub) = validate_token(&jwt_auth.token) {
        student_profile.sub = sub;
        client
            .get_or_create("students")
            .await
            .unwrap()
            .add_or_update(&[student_profile], Some("sub"))
            .await
            .unwrap();
        //  if let Ok(sub) = validate_token(&jwt_auth.token) {
        //      let new_doc = DBProfileEntry {
        //          sub: sub.clone(),
        //          profile: student_profile,
        //      };
        //      let new_doc =
        //          bson::to_bson(&new_doc).expect("must be able to serialize student profile into BSON");
        //      let new_doc = new_doc.as_document().unwrap();
        //      let mut options = ReplaceOptions::default();
        //      options.upsert = Some(true);
        //      db_client
        //          .database("roomie")
        //          .collection("students")
        //          .replace_one(doc! {"sub": sub }, new_doc.to_owned(), options)
        //          .await
        //          .expect("upsert failed");
        HttpResponse::Ok()
    } else {
        HttpResponse::Forbidden()
    }
}

#[post("/auth")]
pub async fn auth_user(auth_request: web::Json<AuthRequest>) -> impl Responder {
    match get_sub(&auth_request.oauth_token_id).await {
        Ok(sub) => match new_token(&sub) {
            Ok(token) => AuthResponse::JwtToken(token),
            Err(e) => AuthResponse::Error(e.to_string()),
        },
        Err(e) => AuthResponse::Error(e.to_string()),
    }
}

#[post("/profile_image")]
pub async fn post_profile_image(
    web::Query(jwt_auth): web::Query<JWTAuth>,
    mut payload: Multipart,
) -> impl Responder {
    if let Ok(sub) = validate_token(&jwt_auth.token) {
        while let Ok(Some(mut field)) = payload.try_next().await {
            if let Some(content_type) = field.content_disposition() {
                if let Some(name) = content_type.get_name() {
                    if name == "file" {
                        let filename = sanitize_filename::sanitize(format!("{}.jpeg", sub));
                        let directory = std::env::var("STATIC_FILE_DIR")
                            .unwrap_or("./web-app/public/images".to_string());
                        let path = format!("{}/{}", directory, filename);
                        let mut file = web::block(move || std::fs::File::create(&path))
                            .await
                            .unwrap();
                        while let Some(chunk) = field.next().await {
                            let data = chunk.unwrap();
                            file = web::block(move || file.write_all(&data).map(|_| file))
                                .await
                                .unwrap();
                        }
                        return HttpResponse::Ok().body(sub);
                    }
                }
            }
        }
        HttpResponse::ExpectationFailed().body("")
    } else {
        HttpResponse::Forbidden().body("")
    }
}

#[get("/test_profile")]
pub async fn test_image_upload() -> impl Responder {
    let html = r#"<html>
        <head><title>Upload Test</title></head>
        <body>
            <form id="pfp" target="/" method="post" enctype="multipart/form-data">
                <canvas id="canvas" width="256" height="256">
                nothing to see 
                </canvas>
                <input id="token" type="text" name="text"/>
                <input id="image" type="file" name="file" accept="image/*"/>
                <button type="submit">Submit</button>
            </form>
            <script>
            let form = document.getElementById('pfp')
document.getElementById('image').onchange = function(e) {
  var img = new Image();
  img.onload = draw;
  img.onerror = failed;
  img.src = URL.createObjectURL(this.files[0]);
};
function draw() {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  let new_width = this.height >= this.width ? canvas.width : this.width/this.height*canvas.width;
  let new_height = this.width >= this.height ? canvas.height : this.height/this.width*canvas.height;
  let x_offset = this.height >= this.width ? 0 : -0.5*(new_width-new_height);
  let y_offset = this.width >= this.height ? 0 : -0.5*(new_height-new_width);
  ctx.drawImage(this, x_offset, y_offset, new_width, new_height);
}
function failed() {
  console.error("The provided file couldn't be loaded as an Image media");
}
function sendImage(token) {
    return function(blob) {
        let formData = new FormData();
        formData.append("file", blob);
        fetch("./profile_image?token="+token, {
            method: "POST",
            body: formData
        }).then(response => response.text()).then(data => console.log(data))
    }
}
form.addEventListener('submit', (event) => {
    event.preventDefault()
    let token = document.getElementById('token').value

    let canvas = document.getElementById('canvas')
    let ctx = canvas.getContext('2d')
    console.log('evecat')
    canvas.toBlob(sendImage(token), 'image/jpeg', 0.8)
})
            </script>
        </body>
    </html>"#;

    HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(html)
}
