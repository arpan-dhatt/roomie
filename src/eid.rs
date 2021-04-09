use crate::model::BackendEIDFormData;
use actix_web::{client::Client, test, web::Buf, HttpMessage};
use regex::Regex;

pub async fn check_eid(eid: &str) -> Result<bool, &'static str> {
    let client = Client::default();
    let mut response = client.get("https://idmanager.its.utexas.edu/eid_self_help/?forgotPassword")
        .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15")
        .header("Host", "idmanager.its.utexas.edu")
        .send()
        .await.map_err(|_| "initial form completion resulted in error")?;
    let body = response
        .body()
        .await
        .map_err(|_| "error in getting response body from entry page")?
        .bytes()
        .to_vec();
    let body = String::from_utf8_lossy(&body);
    let form = get_form_data(&body, eid);
    println!("{:?}", form);
    let cookies = response
        .cookies()
        .map_err(|_| "cookies could not be obtained")?
        .clone();
    let mut response = client
        .post("https://idmanager.its.utexas.edu/eid_self_help/")
        .header("Conent-Type", "application/x-www-form-urlencoded")
        .cookie(cookies.get(0).unwrap().clone())
        .cookie(cookies.get(1).unwrap().clone())
        .send_form(&form)
        .await
        .map_err(|_| "failed to send second request")?;
    let body = response
        .body()
        .await
        .map_err(|_| "error in getting response body from check page")?
        .bytes()
        .to_vec();
    let body = String::from_utf8_lossy(&body);
    println!("{:?}", body);
    Ok(check_final_page(&body))
}

fn get_form_data(body: &str, eid: &str) -> BackendEIDFormData {
    let form_id_regex = Regex::new(r"(qwicap-form-id' value='[\d\w]+')").unwrap();
    let page_id_regex = Regex::new(r"(qwicap-page-id' value='[\d\w]+')").unwrap();
    let form_id_tag = form_id_regex
        .captures_iter(body)
        .next()
        .unwrap()
        .get(0)
        .unwrap()
        .as_str();
    let page_id_tag = page_id_regex
        .captures_iter(body)
        .next()
        .unwrap()
        .get(0)
        .unwrap()
        .as_str();

    let form_id = form_id_tag
        .replace("qwicap-form-id' value='", "")
        .replace("'", "");
    let page_id = page_id_tag
        .replace("qwicap-page-id' value='", "")
        .replace("'", "");
    let page_id_tag = page_id_regex
        .captures_iter(body)
        .next()
        .unwrap()
        .get(0)
        .unwrap()
        .as_str();
    BackendEIDFormData {
        page_id,
        form_id,
        eid: eid.to_string(),
        cont1: "Continue".to_string(),
        cont2: "Continue".to_string(),
    }
}

fn check_final_page(body: &str) -> bool {
    (body.contains("Page ID: RP8") || body.contains("Page ID: RP3")) && !body.contains("valid")
}

#[actix_rt::test]
async fn test_eid_checker() {
    use dotenv::dotenv;
    dotenv().ok();
    let valid_eid = std::env::var("TEST_VALID_EID").unwrap();
    assert_eq!(Ok(true), check_eid(&valid_eid).await);
    let invalid_eid = "hello";
    assert_eq!(Ok(false), check_eid(invalid_eid).await);
}
