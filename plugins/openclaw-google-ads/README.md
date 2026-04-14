# OpenClaw Google Ads Agency Plugin

Google Ads ajans operasyonlari icin OpenClaw agent'ina tool capability ekleyen production-grade TypeScript plugin.

## Ozellikler

- MCC ve alt hesaplari listeler, hesap saglik/performans ozetleri uretir.
- Kampanya, policy, billing ve spend anomaly analizleri yapar.
- Action mode acikken kampanya durdurma/aktif etme/butce guncelleme aksiyonlari calistirir.
- Secret bilgileri sadece environment variable uzerinden alir, prompt'a gommez.
- Moduler yapi: `config`, `types`, `services`, `clients`, `tools`, `validators`, `utils`, `constants`, `errors`.

## Tool Seti

- `list_google_ads_accounts`
- `get_account_overview`
- `get_account_health`
- `list_campaigns`
- `get_campaign_detail`
- `get_billing_status`
- `get_policy_issues`
- `get_spend_anomalies`
- `get_performance_summary`
- `pause_campaign`
- `enable_campaign`
- `update_campaign_budget`
- `list_disapproved_ads`
- `explain_account_status`

Her tool Zod tabanli input/output schema ile validation yapar.

## Kurulum

```bash
cd plugins/openclaw-google-ads
npm install
npm run setup
```

`npm run setup` kurulumda zorunlu degerleri interaktif olarak ister ve `.env` dosyasini olusturur/gunceller.
Eksik veya gecersiz zorunlu alan varsa plugin baslangicta calismaz.

### Zorunlu Alanlar

- `GOOGLE_ADS_DEVELOPER_TOKEN`
- `GOOGLE_ADS_CLIENT_ID`
- `GOOGLE_ADS_CLIENT_SECRET`
- `GOOGLE_ADS_REFRESH_TOKEN`
- `GOOGLE_ADS_LOGIN_CUSTOMER_ID` (10-20 hane, sadece rakam)
- `GOOGLE_ADS_MANAGER_CUSTOMER_ID` (10-20 hane, sadece rakam)

## Build ve Local Gelistirme

```bash
npm run typecheck
npm run build
npm run dev
```

## OpenClaw Entegrasyonu

1. Plugin paketini build edin.
2. OpenClaw plugin loader'da `openclaw.plugin.json` dosyasini secin.
3. Plugin secildiginde `entrypoint=dist/index.js` yuklenir.
4. OpenClaw agent tool selection asamasinda bu plugin tool'lari secilebilir olur.

## Mode ve Guvenlik

- `OPENCLAW_GOOGLE_ADS_MODE=read-only`: Action tool'lar engelli.
- `OPENCLAW_GOOGLE_ADS_MODE=action` ve `OPENCLAW_GOOGLE_ADS_ENABLE_ACTIONS=true`: Action tool'lar aktif.

Action tool'lari bu iki kosul saglanmadan calismaz.

## Ornek Kullanim Promptlari

- "Sorunlu hesaplari goster" -> `list_google_ads_accounts` + `get_account_health`
- "Bu hesabin neden harcamasi dustu?" -> `get_spend_anomalies` + `explain_account_status`
- "Odeme problemi olan musterileri listele" -> `get_billing_status`
- "Reddedilen reklamlari goster" -> `list_disapproved_ads`
- "Su kampanyayi kapat" -> `pause_campaign` (action mode gerekli)

## Production Notlari

- API limitleri ve retry politikasi ihtiyacina gore client katmaninda genisletilebilir.
- Logging SIEM/observability pipeline'a yonlendirilebilir.
- Tool-level authorization OpenClaw tarafinda actor/role bazli filtreyle tamamlanmalidir.
