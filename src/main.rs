mod auth;
mod model;
mod handlers;

use actix_web::{App, HttpServer, web};
use actix_files as fs;
use dotenv::dotenv;
use mongodb::{Client, options::ClientOptions};
use std::env;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    
    let client_options = ClientOptions::parse(
        &format!("mongodb+srv://{}:{}@{}/{}?retryWrites=true&w=majority",
        env::var("MONGODB_USERNAME").expect("missing MONGODB_USERNAME environment variable"),
        env::var("MONGODB_PASSWORD").expect("missing MONGODB_PASSWORD environment variable"),
        env::var("MONGODB_ADDRESS").expect("missing MONGODB_ADDRESS environment variable"),
        env::var("MONGODB_NAME").expect("missing MONGODB_NAME environment variable")
    )).await.expect("MONGODB configuration must succeed");

    let client = Client::with_options(client_options).expect("MONGODB client connection must succeed");
    let client = web::Data::new(client);
    for db_name in client.list_database_names(None, None).await.unwrap() {
        println!("{}", db_name);
    }
    HttpServer::new(move || {
        App::new()
            .app_data(client.clone())
            .service(handlers::get_student)
            .service(handlers::post_student)
            .service(handlers::auth_user)
            .service(fs::Files::new("/", "./web-app/public"))
            .service(handlers::index)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
