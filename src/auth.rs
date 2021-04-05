use std::env;

use actix_web::client::Client;
use hmac::{Hmac, NewMac};
use jwt::{RegisteredClaims, SignWithKey, VerifyWithKey};
use sha2::Sha256;

use crate::model::InternalOAuthResult;

pub fn new_token(sub: &str) -> Result<String, &'static str> {
    let claims = RegisteredClaims {
        issuer: Some("arpan.one".to_string()),
        subject: Some(sub.to_string()),
        ..Default::default()
    };

    let secret = env::var("TOKEN_SECRET").map_err(|_| "TOKEN_SECRET is not defined")?;
    let secret = secret.as_bytes();

    let key: Hmac<Sha256> = Hmac::new_varkey(secret).map_err(|_| "Invalid key")?;
    let signed_token = claims
        .sign_with_key(&key)
        .map_err(|_| "Claims signing failed")?;

    Ok(signed_token)
}

pub fn validate_token(jwt_token: &str) -> Result<String, &'static str> {
    let secret = env::var("TOKEN_SECRET").expect("TOKEN_SECRET is not defined");
    let secret = secret.as_bytes();

    let key: Hmac<Sha256> = Hmac::new_varkey(secret).map_err(|_| "Invalid key")?;
    let claims: RegisteredClaims = jwt_token
        .verify_with_key(&key)
        .map_err(|_| "Token parsing failed")?;

    claims.subject.ok_or("Missing subject in token")
}

pub async fn get_sub(token: &str) -> Result<String, &'static str> {
    let client = Client::default();

    let oauth_server_address = env::var("OAUTH_ADDRESS")
        .map_err(|_| "OAUTH ADDRESS environment variable doesn't exist")?;
    let response = client
        .get(format!("{}/auth?token={}", oauth_server_address, token))
        .send()
        .await
        .map_err(|_| "error in sending oauth server request")?
        .body()
        .await
        .map_err(|_| "error in receiving message body")?;
    let result: InternalOAuthResult = serde_json::from_slice(&response)
        .map_err(|_| "failed to deserialize response from oauth server")?;
    match result {
        InternalOAuthResult::Content { sub } => Ok(sub),
        InternalOAuthResult::Error(details) => {
            println!("{}", details);
            Err("oauth server failed to return subject")
        }
    }
}
