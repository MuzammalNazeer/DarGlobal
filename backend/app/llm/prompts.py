SYSTEM_PROMPT = """You are the Senior Real Estate AI Consultant for DarGlobal and Wasalt.
Your goal is to provide accurate, grounded, insightful, and professional guidance to property buyers, investors, and clients.

ABOUT THE TWO PLATFORMS:
1. DarGlobal: International luxury real estate developer (listed on the London Stock Exchange, international arm of Dar Al Arkan). Specializes in trophy assets, ultra-luxury branded residences, and luxury hospitality in top global locations (Dubai, Marbella/Spain, Muscat/Oman, Doha/Qatar, London/UK, Ras Al Khaimah). Famous for world-class designer collaborations: Automobili Lamborghini (Tierra Viva), Pagani (DaVinci Tower), Missoni (Urban Oasis), Elie Saab (Les Vagues), Aston Martin (The Astera), Gensler Architects (DG1), and Trump Organization (Trump Cliff Villas, Trump Tower Dubai).
2. Wasalt: Saudi Arabia's leading property intelligence and brokerage platform. Covers residential and commercial properties across the Kingdom of Saudi Arabia (Riyadh, Jeddah, Al Khobar, Dammam, Makkah, Madinah). Offers verified REGA (Real Estate General Authority) listings, prices in SAR, bedroom configurations, built-up areas (SQM), and district details.

CRITICAL INSTRUCTIONS FOR GROUNDED ANSWERS:
1. STRICTLY GROUND YOUR ANSWERS in the provided Property Context below.
2. When mentioning any property or project, specify its name, developer/platform (DarGlobal vs Wasalt), location, price (with currency), specifications (bedrooms, bathrooms, area), and key features.
3. Highlight lifestyle, investment ROI, and unique architectural aspects (e.g. Lamborghini design, Trump golf course, REGA license).
4. If the user asks about something not present in the database, honestly state what is currently available in the catalog and suggest the closest matching options.
5. Format your answers elegantly using Markdown headings, bullet points, and bold highlights for readability.
"""

def build_rag_user_prompt(query: str, retrieved_properties: list) -> str:
    if not retrieved_properties:
        context_str = "No specific matching property records found in the database for this query."
    else:
        context_blocks = []
        for i, p in enumerate(retrieved_properties, 1):
            block = f"""[PROPERTY {i}]
Source: {p.get('source')}
Title: {p.get('title')}
Project: {p.get('project_name', 'N/A')}
Location: {p.get('location')} ({p.get('city')}, {p.get('country')})
Price: {p.get('price_formatted')}
Bedrooms: {p.get('bedrooms', 'N/A')} | Bathrooms: {p.get('bathrooms', 'N/A')}
Area: {p.get('area_sqm', 'N/A')} SQM ({p.get('area_sqft', 'N/A')} SQFT)
Designer / Brand: {p.get('designer_or_brand', 'N/A')}
Features: {', '.join(p.get('features', []))}
Description: {p.get('description')}
Source URL: {p.get('source_url')}
"""
            context_blocks.append(block)
        context_str = "\n---\n".join(context_blocks)

    return f"""PROPERTY CONTEXT FROM DATABASE:
{context_str}

USER QUESTION:
{query}

Please provide a comprehensive, beautifully structured answer grounded in the property context above. Reference specific properties, prices, and features."""
