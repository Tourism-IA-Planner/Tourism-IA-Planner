import random
import re
from datetime import datetime, timedelta
from typing import List, Optional

import pandas as pd
import requests
from pydantic import BaseModel, Field


import re
import os

# Get the current directory where AI.py is located
current_dir = os.path.dirname(os.path.abspath(__file__))
# Define the paths relative to the current directory
tourism_data_file = os.path.join(current_dir, "Comprehensive_Max_Tourism_Dataset.xlsx")
transport_data_file = os.path.join(current_dir, "Comprehensive_Max_Transport_Dataset.xlsx")
tourism_df = pd.read_excel(tourism_data_file)
transport_df = pd.read_excel(transport_data_file)

OLLAMA_API_BASE = "http://localhost:11434/api"


class PlanRequest(BaseModel):
    lieuDepart: str
    cities: List[str]
    dateDepart: str
    dateRetour: str
    budget: float
    userId: Optional[int] = Field(default=None)

    def calculate_total_days(self) -> int:
        date_depart = datetime.strptime(self.dateDepart, "%Y-%m-%d")
        date_retour = datetime.strptime(self.dateRetour, "%Y-%m-%d")
        return (date_retour - date_depart).days


def clean_activity_response(response: str) -> List[str]:
    """Clean and extract activities from Llama's response."""
    # Remove introductory phrases
    response = re.sub(r"Here are \d+ unique tourist activities.*?:\s*\n*", "", response)
    response = re.sub(r"These activities showcase.*$", "", response, flags=re.MULTILINE)
    response = re.sub(r"\(Note:.*?\)", "", response)
    response = re.sub(r"\n+", "\n", response)

    # Split into individual activities
    activities = []
    for line in response.split("\n"):
        # Remove numbering and clean up
        line = re.sub(r"^\d+\.\s*", "", line.strip())
        line = re.sub(r"^[-•]\s*", "", line)
        line = re.sub(r"^\s*and\s+", "", line)

        if line and not line.startswith("Let me know") and not line.endswith(":"):
            activities.append(line.strip())

    return [a for a in activities if a and len(a) > 5]  # Filter out very short or empty items


def query_llama(prompt: str) -> str:
    """Send a query to Llama 3 via Ollama API"""
    url = f"{OLLAMA_API_BASE}/generate"
    payload = {
        "model": "llama3",
        "prompt": prompt,
        "stream": False
    }

    response = requests.post(url, json=payload)
    if response.status_code == 200:
        return response.json()['response']
    else:
        raise Exception(f"Error querying Llama: {response.text}")


def generate_activity_prompt(city: str, num_activities: int) -> str:
    return f"""List exactly {num_activities} specific tourist activities in {city} along with their approximate prices in MAD. 
    Ensure that the prices are realistic and reflect typical costs for tourists in Morocco.
    Format each activity as: "Activity Name - Price in MAD".
    Do not include any additional text or explanations."""


def parse_activity_response(response: str) -> List[dict]:
    """Parse the response from Llama3 to extract activities and their prices."""
    activities = []
    for line in response.split("\n"):
        line = line.strip()
        if " - " in line:
            # Remove any leading numbers/symbols before splitting
            clean_line = re.sub(r'^[\d•*.\s]+', '', line)  # Remove numbering/bullets
            activity_name, price_part = clean_line.split(" - ", 1)

            # Clean any remaining special characters at start
            activity_name = re.sub(r'^[^a-zA-Z]+', '', activity_name.strip())

            price = re.search(r"\d+", price_part)
            if price and activity_name:
                activities.append({
                    "name": activity_name.strip(),
                    "price": int(price.group())
                })
    return activities


def adjust_activities_to_budget(activities: List[dict], remaining_budget: float) -> List[dict]:
    """Adjust activities to fit within the remaining budget."""
    # Sort activities by price (ascending)
    sorted_activities = sorted(activities, key=lambda x: x["price"])

    selected_activities = []
    total_cost = 0

    for activity in sorted_activities:
        if total_cost + activity["price"] <= remaining_budget:
            selected_activities.append(activity)
            total_cost += activity["price"]
        else:
            break

    return selected_activities


def adjust_hotel_to_budget(city: str, budget: float) -> dict:
    """Adjust hotel selection based on the budget."""
    hotel_df = tourism_df[(tourism_df['Ville'] == city) & (tourism_df['Type de donnée'] == 'Hôtel')]
    if not hotel_df.empty:
        # Sort hotels by cost
        sorted_hotels = hotel_df.sort_values(by='Coût (MAD)')
        if budget < 1000:  # Low budget
            hotel = sorted_hotels.iloc[0].to_dict()
        elif budget > 5000:  # High budget
            hotel = sorted_hotels.iloc[-1].to_dict()
        else:  # Medium budget
            hotel = sorted_hotels.iloc[len(sorted_hotels) // 2].to_dict()
        return hotel
    else:
        return {"Nom de l'élément": 'Standard Hotel', "Coût (MAD)": random.uniform(80, 120)}

def adjust_transport_to_budget(departure_city: str, arrival_city: str, budget: float) -> float:
    """Adjust transport cost based on the budget."""
    transport = transport_df[(transport_df['Ville de départ'] == departure_city) &
                             (transport_df['Ville d\'arrivée'] == arrival_city)]
    if not transport.empty:
        base_cost = float(transport.iloc[0]['Distance (km)']) * 2
        if budget < 1000:  # Low budget
            return base_cost * 0.8  # 20% discount
        elif budget > 5000:  # High budget
            return base_cost * 1.2  # 20% premium
        else:  # Medium budget
            return base_cost
    else:
        return random.uniform(40, 60)



def get_nearest_city(current_city: str, remaining_cities: List[str], transport_df: pd.DataFrame) -> str:
    distances = []
    for city in remaining_cities:
        try:
            # Check both directions for transport data
            forward_distance = transport_df[
                (transport_df['Ville de départ'] == current_city) &
                (transport_df['Ville d\'arrivée'] == city)
            ]['Distance (km)'].values

            reverse_distance = transport_df[
                (transport_df['Ville de départ'] == city) &
                (transport_df['Ville d\'arrivée'] == current_city)
            ]['Distance (km)'].values

            distance = forward_distance[0] if forward_distance.size > 0 else reverse_distance[0]
            distances.append((city, float(distance)))
        except:
            # Default to large distance if no data exists
            distances.append((city, float('inf')))

    if not distances:
        return random.choice(remaining_cities) if remaining_cities else None

    return min(distances, key=lambda x: x[1])[0]


def optimize_city_order(departure_city: str, cities: List[str], transport_df: pd.DataFrame, start_city: str = None) -> List[str]:
    # Ensure the departure city is included in the list of cities to visit
    all_cities = [departure_city] + [city for city in cities if city != departure_city]

    remaining_cities = all_cities.copy()
    optimized_route = []
    current_city = departure_city

    # Remove the departure city from the remaining cities to avoid revisiting
    remaining_cities.remove(current_city)

    # Check if start_city is valid
    if start_city and start_city in remaining_cities:
        optimized_route.append(start_city)
        remaining_cities.remove(start_city)
        current_city = start_city
    else:
        # Start with the nearest city to departure
        next_city = get_nearest_city(current_city, remaining_cities, transport_df)
        if next_city:
            optimized_route.append(next_city)
            remaining_cities.remove(next_city)
            current_city = next_city
        else:
            print("Warning: No starting city found. Returning incomplete route.")
            return optimized_route

    # Build the rest of the route
    while remaining_cities:
        next_city = get_nearest_city(current_city, remaining_cities, transport_df)
        if next_city:
            optimized_route.append(next_city)
            remaining_cities.remove(next_city)
            current_city = next_city
        else:
            print("Warning: Route ended early due to missing transport data.")
            break

    return optimized_route

def calculate_plan(plan_request: PlanRequest, total_days: int, used_activities: set):
    departure_city = plan_request.lieuDepart
    cities = optimize_city_order(departure_city, plan_request.cities, transport_df)

    # Ensure departure city is explicitly included if missing
    if departure_city not in cities:
        cities.insert(0, departure_city)

    budget = plan_request.budget

    # Calculate distances with error handling
    total_distance = 0
    distances = []

    for i in range(len(cities)):
        from_city = departure_city if i == 0 else cities[i - 1]
        try:
            distance = transport_df[
                (transport_df['Ville de départ'] == from_city) &
                (transport_df['Ville d\'arrivée'] == cities[i])
            ]['Distance (km)'].iloc[0]
            distances.append(float(distance))
            total_distance += float(distance)
        except IndexError:
            # Default to 100km if no data exists
            distances.append(100.0)
            total_distance += 100.0
            print(f"Warning: Missing distance between {from_city} and {cities[i]}")

    # Rest of the code remains unchanged...

    # Calculate days per city proportionally to distance
    days_distribution = [1] * len(cities)  # Minimum 1 day per city
    remaining_days = total_days - len(cities)

    if remaining_days > 0:
        for _ in range(remaining_days):
            city_weights = [d / total_distance for d in distances]
            idx = random.choices(range(len(cities)), weights=city_weights)[0]
            days_distribution[idx] += 1

    # Rest of the function remains the same
    total_cost = 0
    transport_total = 0
    itinerary = []
    current_date = datetime.strptime(plan_request.dateDepart, "%Y-%m-%d")

    for idx, city in enumerate(cities):
        days_spent = days_distribution[idx]
        transport_cost = adjust_transport_to_budget(departure_city, city, budget)
        transport_total += transport_cost
        total_cost += transport_cost

        hotel = adjust_hotel_to_budget(city, budget)
        hotel_cost = float(hotel['Coût (MAD)'])
        hotel_name = hotel['Nom de l\'élément']
        total_hotel_cost = hotel_cost * days_spent
        total_cost += total_hotel_cost

        remaining_budget = budget - total_cost

        if remaining_budget < 0:
            selected_activities = [{"name": "Free City Walk", "price": 0}]
        else:
            num_activities = random.randint(3, 5) if budget > 1000 else random.randint(1, 3)
            activity_prompt = generate_activity_prompt(city, num_activities)
            try:
                activities_response = query_llama(activity_prompt)
                activities_with_prices = parse_activity_response(activities_response)
                selected_activities = [
                                          activity
                                          for activity in activities_with_prices
                                          if activity["name"] not in used_activities
                                      ][:num_activities]

                if len(selected_activities) < num_activities:
                    additional_prompt = generate_activity_prompt(city, num_activities - len(selected_activities))
                    additional_activities = parse_activity_response(query_llama(additional_prompt))
                    selected_activities.extend([
                                                   activity
                                                   for activity in additional_activities
                                                   if activity["name"] not in used_activities
                                               ][:num_activities - len(selected_activities)])

                used_activities.update(activity["name"] for activity in selected_activities)

            except Exception as e:
                print(f"Error generating activities with Llama: {e}")
                selected_activities = [{"name": "Free City Walk", "price": 0}]

            selected_activities = adjust_activities_to_budget(selected_activities, remaining_budget)

            if not selected_activities:
                selected_activities = [{"name": "Free City Walk", "price": 0}]

        total_activities_cost = sum(activity["price"] for activity in selected_activities)
        total_cost += total_activities_cost

        start_date = current_date.strftime("%Y-%m-%d")
        current_date += timedelta(days=days_spent)
        end_date = (current_date - timedelta(days=1)).strftime("%Y-%m-%d")

        itinerary.append({
            "city": city,
            "hotel": {
                "name": hotel_name,
                "pricePerNight": hotel_cost,
                "totalPrice": total_hotel_cost
            },
            "activities": selected_activities,
            "days_spent": days_spent,
            "total_activities_cost": total_activities_cost
        })

        departure_city = city

    return itinerary, total_cost, transport_total
def generate_plans(plan_request: PlanRequest):
    total_days = plan_request.calculate_total_days()

    if len(plan_request.cities) > total_days:
        raise ValueError(
            "Not enough days to visit all cities. Please reduce the number of cities or extend your trip."
        )

    all_plans = []
    used_activities = set()

    for _ in range(3):
        itinerary, total_cost, transport_total = calculate_plan(plan_request, total_days, used_activities)

        # Calculate breakdown of costs
        hotels_total = sum(city['hotel']['totalPrice'] for city in itinerary)
        activities_total = sum(city['total_activities_cost'] for city in itinerary)

        # Ensure total_cost matches the sum of hotels_total, activities_total, and transport_total
        total_cost = hotels_total + activities_total + int(transport_total)

        all_plans.append({
            "plan": itinerary,
            "total_cost": total_cost,
            "total_days_spent": total_days,
            "breakdown": {
                "hotels_total": hotels_total,
                "activities_total": activities_total,
                "transport_total": int(transport_total)
            }
        })

    return all_plans