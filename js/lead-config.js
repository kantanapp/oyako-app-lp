/* lead-config.js ― このLPの設定（公開されるので秘密は書かない）
   LEAD_ENDPOINT / SHARED_TOKEN / CAPTCHA_SITEKEY は、既存LP（lp-seisaku）と同じ値を仮で入れています。
   GA4_ID は既存LPと同じプロパティ。このLPだけ見るときはページパス /oyako-app-lp/ で絞り込む。 */
window.LEAD_CONFIG = {
  LEAD_ENDPOINT:   "https://script.google.com/macros/s/AKfycbxhHjkO9ymkVDgEJK-cwTDJCj8KmcypLq80gQcXmLSJ002ILS3kzuLHQcwdp_C7VseZ/exec",
  SHARED_TOKEN:    "hvvF24HC8uZpnJkWKmDN-AQeHUitZ_Fa",
  CASE_ID:         "oyako-app",
  CAPTCHA_SITEKEY: "0x4AAAAAAEF6AUXuRUngrNPU",
  GA4_ID:          "G-2EXJRN9380",
  DEMO_URL:        "https://kantanapp.github.io/chiri-notes-demo/"
};
