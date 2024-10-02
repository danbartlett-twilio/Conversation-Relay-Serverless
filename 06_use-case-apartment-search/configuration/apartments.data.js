/**
 * apartment-data.js
 * 
 * These are the functions that are available for this USE CASE.
 * The LLM can call these functions as needed.
 * 
 * This is a very simple node script that will just "stringify"
 * the functions and send them to console.log. You can copy and
 * paste the output and then add it to the appropriate DynamoDB
 * record for the use case.
 * 
 * run this command:
 * 
 * node ./apartment-data.js
 * 
 * ...from the command line in this directory to get the output
 */

/**
 * Save to DynamoDB
 * pk => apartments
 * sk => database
 * apartmentDetails => stringify data below
 */

let apartmentDetails = {
    "studio": {
      "layout": "Studio",
      "squareFeet": 450,
      "rent": 1050,
      "moveInDate": "2024-09-15",
      "features": ["1 bathroom", "open kitchen", "private balcony"],
      "petPolicy": "No pets allowed.",
      "fees": {
        "applicationFee": 50,
        "securityDeposit": 300
      },
      "parking": "1 reserved parking spot included.",
      "specials": "First month's rent free if you move in before 2024-09-30.",
      "incomeRequirements": "Income must be 2.5x the rent.",
      "utilities":
        "Water, trash, and Wi-Fi internet included. Tenant pays electricity and gas.",
      "location": {
        "street": "1657 Coolidge Street",
        "city": "Missoula",
        "state": "Montana",
        "zipCode": "59802"
      }
    },
    "one-bedroom": {
      "layout": "One-bedroom",
      "squareFeet": 600,
      "rent": 1200,
      "moveInDate": "2024-09-20",
      "features": ["1 bedroom", "1 bathroom", "walk-in closet"],
      "petPolicy": "Cats only. No dogs or any other animals.",
      "fees": {
        "applicationFee": 50,
        "securityDeposit": 400
      },
      "parking": "1 reserved parking spot included.",
      "specials": "First month's rent free if you move in before 2024-09-25.",
      "incomeRequirements": "Income must be 3x the rent.",
      "utilities":
        "Water, trash, gas, and Wi-Fi internet included. Tenant pays electricity.",
      "location": {
        "street": "1705 Adams Street",
        "city": "Missoula",
        "state": "Montana",
        "zipCode": "59802"
      }
    },
    "two-bedroom": {
      "layout": "Two-bedroom",
      "squareFeet": 950,
      "rent": 1800,
      "moveInDate": "2024-09-10",
      "features": ["2 bedrooms", "2 bathrooms", "walk-in closets", "balcony"],
      "petPolicy": "Cats and dogs allowed, but only 1 each.",
      "fees": {
        "applicationFee": 50,
        "securityDeposit": 500
      },
      "parking": "2 reserved parking spots included.",
      "specials": "Waived application fee if you move in before 2024-09-20.",
      "incomeRequirements": "Income must be 3x the rent.",
      "utilities":
        "Water, trash, gas, and Wi-Fi internet included. Tenant pays electricity.",
      "location": {
        "street": "1833 Jefferson Avenue",
        "city": "Missoula",
        "state": "Montana",
        "zipCode": "59802"
      }
    },
    "three-bedroom": {
      "layout": "Three-bedroom",
      "squareFeet": 1200,
      "rent": 2500,
      "moveInDate": "2024-09-25",
      "features": [
        "3 bedrooms",
        "2 bathrooms",
        "walk-in closets",
        "private balcony",
        "extra storage"
      ],
      "petPolicy":
        "Up to 2 dogs and 2 cats are allowed, and other small pets like hamsters are allwed as well. No more than 4 total pets.",
      "fees": {
        "applicationFee": 50,
        "securityDeposit": 600
      },
      "parking": "2 reserved parking spots included.",
      "specials": "No move-in fees if you sign a 12-month lease.",
      "incomeRequirements": "Income must be 3x the rent.",
      "utilities":
        "Water, trash, gas, and Wi-Fi internet included. Tenant pays electricity.",
      "location": {
        "street": "1945 Roosevelt Way",
        "city": "Missoula",
        "state": "Montana",
        "zipCode": "59802"
      }
    }
};
console.log(JSON.stringify(apartmentDetails));