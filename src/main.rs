mod auth;
mod eid;
mod handlers;
mod model;

use actix_files as fs;
use actix_web::{web, App, middleware, HttpServer};
use dotenv::dotenv;
use lazy_static::lazy_static;
use std::env;
use env_logger;

lazy_static! {
    static ref MEILISEARCH_ADDRESS: String =
        env::var("MEILISEARCH_ADDRESS").expect("missing MEILISEARCH_ADDRESS environment variable");
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init();
    //  let client_options = ClientOptions::parse(
    //      &format!("mongodb+srv://{}:{}@{}/{}?retryWrites=true&w=majority",
    //      env::var("MONGODB_USERNAME").expect("missing MONGODB_USERNAME environment variable"),
    //      env::var("MONGODB_PASSWORD").expect("missing MONGODB_PASSWORD environment variable"),
    //      env::var("MONGODB_ADDRESS").expect("missing MONGODB_ADDRESS environment variable"),
    //      env::var("MONGODB_NAME").expect("missing MONGODB_NAME environment variable")
    //  )).await.expect("MONGODB configuration must succeed");
    //
    //  let client = Client::with_options(client_options).expect("MONGODB client connection must succeed");
    //  let client = web::Data::new(client);
    //  for db_name in client.list_database_names(None, None).await.unwrap() {
    //      println!("{}", db_name);
    //  }
    let client = meilisearch_sdk::client::Client::new(&MEILISEARCH_ADDRESS, "masterKey");
    let client = web::Data::new(client);
    HttpServer::new(move || {
        App::new()
            .wrap(middleware::Logger::default())
            .app_data(client.clone())
            .service(handlers::get_student)
            .service(handlers::post_student)
            .service(handlers::auth_user)
            .service(
                fs::Files::new(
                    "/",
                    env::var("PUBLIC_DIR").expect("missing PUBLIC_DIR environment variable"),
                )
                .show_files_listing()
                .index_file("index.html"),
            )
    })
    .bind(env::var("BIND_ADDRESS").expect("missing BIND_ADDRESS environment variable"))?
    .run()
    .await
}
