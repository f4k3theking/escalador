#!/usr/bin/env python3
import requests
import json

print("🚀 Extraindo dados do scraper...")

# 1. Extrair dados do scraper Python
scraper_url = "http://localhost:5000/scrape"
payload = {
    "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=calvo&search_type=keyword_unordered"
}

try:
    # Fazer requisição para o scraper
    response = requests.post(scraper_url, json=payload, timeout=300)
    
    if response.status_code == 200:
        scraped_data = response.json()
        print(f"✅ Extraídos {len(scraped_data.get('ads', []))} anúncios!")
        
        # 2. Enviar para nosso backend Node.js
        print("📤 Enviando para o backend...")
        
        backend_url = "http://localhost:3001/api/scraper/process-ads"
        
        backend_response = requests.post(backend_url, json=scraped_data, timeout=60)
        
        if backend_response.status_code == 200:
            result = backend_response.json()
            print(f"🎉 SUCESSO!")
            print(f"✅ Processados: {result.get('processed', 0)}")
            print(f"⏭️  Ignorados: {result.get('skipped', 0)}")
            print(f"❌ Erros: {result.get('errors', 0)}")
            print(f"📊 Total recebido: {result.get('total_received', 0)}")
            
            # 3. Verificar se salvou
            print("\n🔍 Verificando dados salvos...")
            check_url = "http://localhost:3001/api/scraper/ads?limit=3"
            check_response = requests.get(check_url)
            
            if check_response.status_code == 200:
                saved_data = check_response.json()
                print(f"📊 Total de anúncios no banco: {saved_data.get('pagination', {}).get('total', 0)}")
                
                if saved_data.get('ads'):
                    print("\n📝 Exemplos salvos:")
                    for i, ad in enumerate(saved_data['ads'][:3], 1):
                        print(f"{i}. {ad.get('page_name', 'N/A')} - {ad.get('ad_description', 'N/A')[:50]}...")
            
        else:
            print(f"❌ Erro no backend: {backend_response.text}")
    else:
        print(f"❌ Erro no scraper: {response.text}")
        
except Exception as e:
    print(f"❌ Erro: {e}")

input("\nPressione Enter para fechar...")
