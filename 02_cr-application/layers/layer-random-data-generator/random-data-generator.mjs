// Object containing Arrays of random data
const randomData = {};
randomData.firstNames = ["Mary", "John", "Susan", "James", "Karen", "Michael", "Jennifer", "David", "Linda", "Richard", "Patricia", "Robert", "Barbara", "William", "Margaret", "Joseph", "Betty", "Charles", "Nancy", "Thomas", "Kimberly", "Daniel", "Dorothy", "Matthew", "Sarah", "George", "Deborah", "Donald", "Jessica", "Paul", "Emily", "Mark", "Sandra", "Edward", "Melissa", "Kenneth", "Laura", "Steven", "Donna", "Brian", "Carol", "Ronald", "Michelle", "Timothy", "Amanda", "Jason", "Helen", "Jeffrey", "Sharon", "Frank", "Betty", "Brian", "Patricia", "Harold", "Laura", "Jason", "Amy", "Gary", "Anna", "Robert", "Arthur", "Raymond", "Roger", "Jeremy", "Tina", "Philip", "Marie", "Larry", "Theresa", "Russell", "Tiffany", "Alan", "Brenda", "Philip", "Julie", "Eugene", "Christine", "Carl", "Miranda", "Samuel", "Victoria", "Walter", "Kristen", "Vincent", "Cynthia", "Stephen", "April", "Gregory", "Carolyn", "Harry", "Kathleen", "Bruce", "Bonnie", "Dennis", "Wendy", "Willie", "Sara", "Edward", "Monica", "Douglas", "Beth", "Ryan", "Tanya", "Martin", "Lori", "Wayne", "Alice", "Jose", "Erin", "Jesse", "Nichole", "Terry", "Katherine", "Louis", "Sherry", "Randy", "Ann", "Lawrence", "Angela", "Gerard", "Gloria", "Brandon", "Anita", "Adam", "Leah", "Micheal", "Jacqueline", "Philip", "Catherine", "Clarence", "Christina", "Frederick", "Tonya", "Albert", "Carla", "Christopher", "Stacy", "Dave", "Kendra", "Joshua", "Kristin", "Johnny", "Cassandra", "Jimmy", "Diane", "Harry", "Tara", "Isaac", "Joan", "Damian", "Shannon", "Evan", "Jamie", "Noah", "Lydia", "Mason", "Janet", "Alice", "Tammy", "Robin", "Jacqueline", "Parker", "Tracy", "Israel", "Regina", "Felix", "Candice", "Calvin", "Gina", "Leroy", "Caroline", "Dana", "Yvonne", "Chris", "Casey", "Juan", "Tracey", "Alvin", "Brianna", "Aaron", "Martha", "Alberto", "Alexandra", "Antonio", "Pamela", "Arthur", "Renee", "Bob", "Erika", "Carlos", "Charlotte", "Christian", "Stacey", "Clifford", "Heather", "Colin", "Melanie", "Dale", "Katie", "Gerard", "Kim", "Ian", "Ernest", "Kurtis", "Harriett", "Darrell", "Debbie", "Geoffrey", "Hannah", "Herbert", "Krystal", "Jerome", "Kristina", "Joel", "Leslie", "Julian", "Toni", "Leonard", "Valerie", "Rodney", "Vanessa", "Seth", "Margie", "Sylvester", "Myra", "Troy", "Marlene", "Vince", "Geneva", "Virgil", "Julia", "Waldo", "Janice", "Amos", "Grace", "Austin", "Mindy", "Brandon", "Vivian", "Bruno", "Cheryl", "Carl", "Felicia", "Christian", "Bernice", "Craig", "Jenna", "Al", "Karyn", "Charlie", "Kimberley", "Doug", "Kacey", "Eldon", "Kelley", "Emmanuel", "Bobbie", "Ezra", "Delores", "Ferdinand", "Celeste", "Hamilton", "Allyson", "Hugh", "Becky", "Jim", "Audra", "Kris", "Jo", "Lorenzo", "Consuelo", "Marshall", "Ashley", "Matt", "Alison", "Octavio", "Alyssa", "Reid", "Felecia", "Stacy", "Sheena", "Tristan", "Yvette", "Will", "Amber", "Blane", "Corrine", "Elliot", "Elvira", "Ivan", "Letha", "Kai", "Mitsy", "Quincy", "Selena", "Rolf", "Tabitha", "Tim", "Trina", "Uriah", "Zara", "Vito", "Agnes", "Yael", "Adele", "Barbie", "Benji", "Charity", "Deon", "Freda", "Eddie", "Hope", "Finn", "Jasmine", "Gordon", "Lenora", "Hugo", "Mari", "Ivor", "Mya", "Josef", "Neve", "Kaleb", "Rhoda", "Lenny", "Evette", "Manny", "Adeline", "Norbert", "Ella", "Oliver", "Kristen", "Otis", "Candy", "Pearce", "Ingrid", "Quentin", "Lynda", "Roger", "Rhea", "Sandy", "Tammie", "Tucker", "Nadia", "Ulrich", "Matilda", "Vaughn", "Ruby", "Warner", "Rosie", "Zachariah", "Pat", "Kane", "Marva" ];
randomData.lastNames = ["Wheeler", "Horton", "Garza", "McGee", "Waters", "Nunez", "Boyle", "McMahon", "Berg", "Rangel", "Donovan", "Mullen", "Fritz", "Escobar", "Pennington", "Kirby", "Becker", "Merrill", "Gentry", "Vance", "Banks", "Pace", "Strong", "Martin", "Stark", "Clements", "Barajas", "Wu", "Koch", "Patel", "Wang", "Solomon", "Kearney", "Washington", "Short", "Steele", "Frost", "Baron", "Cisneros", "Blackburn", "Conway", "Wall", "Valenzuela", "Marsden", "Nielsen", "Connor", "Trujillo", "Molina", "Finch", "Browning", "Cherry", "Bloom", "Garrett", "Singleton", "Laurent", "Pollard", "Cooley", "Rowland", "Kidwell", "Lozano", "Villalobos", "Cantu", "Baird", "Slater", "Leary", "Valentine", "Foote", "Dent", "Briggs", "McClure", "Rowe", "Ortega", "Parks", "Hess", "Salas", "Bass", "Vo", "McIntyre", "Solis", "Drake", "Cardenas", "Walters", "Cuevas", "Luna", "Giles", "Pace", "Kramer", "Garza", "Bird", "Sexton", "Bridges", "Hansen", "Cline", "Tyson", "Hahn", "Foley", "Brennan", "Britt", "Squires", "Britton", "Braun", "Crosby", "Savage", "Moyer", "Landry", "Anders", "Dobbins", "Bruno", "Marrero", "Hurst", "Salas", "Sheppard", "Hardin", "Maverick", "McGrath", "Sullivan", "Hendrix", "Glass", "Jewell", "Dunlap", "Webster", "Soriano", "English", "Pierce", "Reilly", "Ramsey", "Pacheco", "Wells", "Talley", "Carson", "Vaughan", "Clements", "Hayes", "Sims", "Ritter", "Sanders", "Puckett", "Peterson", "Lane", "Bush", "Quinn", "Rodriguez", "Hampton", "Medina", "Davis", "Figueroa", "Kirk", "York", "Holmes", "Carrillo", "Fernandez", "Villarreal", "Benson", "Lyn"];
randomData.addresses = [ { "address_line_1": "123 Center Street", "city": "New York", "state_province_region": "New York", "postal_code": "10001", "country": "United States" }, { "address_line_1": "321 Main Street", "city": "Los Angeles", "state_province_region": "California", "postal_code": "90001", "country": "United States" }, { "address_line_1": "456 West Avenue", "city": "Chicago", "state_province_region": "Illinois", "postal_code": "60601", "country": "United States" }, { "address_line_1": "568 Amber Drive", "city": "Houston", "state_province_region": "Texas", "postal_code": "77001", "country": "United States" }, { "address_line_1": "2308 Grand Boulevard", "city": "Phoenix", "state_province_region": "Arizona", "postal_code": "85001", "country": "United States" }, { "address_line_1": "7402 Pacific Ave", "city": "Philadelphia", "state_province_region": "Pennsylvania", "postal_code": "19147", "country": "United States" }, { "address_line_1": "9631 Grape St", "city": "San Antonio", "state_province_region": "Texas", "postal_code": "78247", "country": "United States" }, { "address_line_1": "4282 Fourth St", "city": "San Diego", "state_province_region": "California", "postal_code": "92101", "country": "United States" }, { "address_line_1": "3014 Sunset Blvd", "city": "Dallas", "state_province_region": "Texas", "postal_code": "75201", "country": "United States" }, { "address_line_1": "8754 Main Street", "city": "San Jose", "state_province_region": "California", "postal_code": "95126", "country": "United States" }, { "address_line_1": "14712 First Road", "city": "Austin", "state_province_region": "Texas", "postal_code": "73301", "country": "United States" }, { "address_line_1": "9856 Oak Street", "city": "Jacksonville", "state_province_region": "Florida", "postal_code": "32099", "country": "United States" }, { "address_line_1": "4567 Sunset Blvd", "city": "Fort Worth", "state_province_region": "Texas", "postal_code": "76006", "country": "United States" }, { "address_line_1": "4781 West Street", "city": "Columbus", "state_province_region": "Ohio", "postal_code": "43085", "country": "United States" }, { "address_line_1": "87564 Second Street", "city": "San Francisco", "state_province_region": "California", "postal_code": "94102", "country": "United States" }, { "address_line_1": "590 Maple Drive", "city": "Charlotte", "state_province_region": "North Carolina", "postal_code": "28202", "country": "United States" }, { "address_line_1": "42 Oak Street", "city": "San Diego", "state_province_region": "California", "postal_code": "92101", "country": "United States" }, { "address_line_1": "116B Elm Street", "city": "Seattle", "state_province_region": "Washington", "postal_code": "98101", "country": "United States" }, { "address_line_1": "88 High Street", "city": "Denver", "state_province_region": "Colorado", "postal_code": "80014", "country": "United States" }, { "address_line_1": "450 Cherry Hill Drive", "city": "Atlanta", "state_province_region": "Georgia", "postal_code": "30301", "country": "United States" }, { "address_line_1": "12 Main Street", "city": "Boston", "state_province_region": "Massachusetts", "postal_code": "02110", "country": "United States" }, { "address_line_1": "33 Oak Lane", "city": "Washington", "state_province_region": "District of Columbia", "postal_code": "20001", "country": "United States" }, { "address_line_1": "5 Apple Street", "city": "Nashville", "state_province_region": "Tennessee", "postal_code": "37201", "country": "United States" }, { "address_line_1": "741 Eastview Drive", "city": "Las Vegas", "state_province_region": "Nevada", "postal_code": "89101", "country": "United States" }, { "address_line_1": "4343 High Street", "city": "Portland", "state_province_region": "Oregon", "postal_code": "97201", "country": "United States" }, { "address_line_1": "678 Pine St.", "city": "Louisville", "state_province_region": "Kentucky", "postal_code": "40202", "country": "United States" }, { "address_line_1": "57 Ocean Drive", "city": "Miami", "state_province_region": "Florida", "postal_code": "33101", "country": "United States" }, { "address_line_1": "4422 Hillside Lane", "city": "Cleveland", "state_province_region": "Ohio", "postal_code": "44101", "country": "United States" }, { "address_line_1": "219 Olive Street", "city": "Tucson", "state_province_region": "Arizona", "postal_code": "85701", "country": "United States" }, { "address_line_1": "600 Green Avenue", "city": "Pittsburgh", "state_province_region": "Pennsylvania", "postal_code": "15219", "country": "United States" }, { "address_line_1": "763 5th Avenue North", "city": "Minneapolis", "state_province_region": "Minnesota", "postal_code": "55401", "country": "United States" }, { "address_line_1": "2 Redwood Avenue", "city": "Tampa", "state_province_region": "Florida", "postal_code": "33602", "country": "United States" }, { "address_line_1": "973 East 9th Street", "city": "Baltimore", "state_province_region": "Maryland", "postal_code": "21202", "country": "United States" }, { "address_line_1": "1055 Sea View Drive", "city": "Long Beach", "state_province_region": "California", "postal_code": "90802", "country": "United States" }, { "address_line_1": "86 Evergreen Parkway", "city": "Anaheim", "state_province_region": "California", "postal_code": "92801", "country": "United States" }, { "address_line_1": "72 Elm Street", "city": "Oakland", "state_province_region": "California", "postal_code": "94601", "country": "United States" }, { "address_line_1": "2033 Oak Lane", "city": "Kansas City", "state_province_region": "Missouri", "postal_code": "64101", "country": "United States" }, { "address_line_1": "1102 Lake View Drive", "city": "New Orleans", "state_province_region": "Louisiana", "postal_code": "70112", "country": "United States" }, { "address_line_1": "999 Calle De La Playa", "city": "San Juan", "state_province_region": "Puerto Rico", "postal_code": "00901", "country": "United States" }, { "address_line_1": "634 Jarvis Street", "city": "San Francisco", "state_province_region": "California", "postal_code": "94102", "country": "United States" }, { "address_line_1": "5002 Sunset Boulevard", "city": "Sacramento", "state_province_region": "California", "postal_code": "94203", "country": "United States" }, { "address_line_1": "3082 Stone Pine Lane", "city": "La Jolla", "state_province_region": "California", "postal_code": "92037", "country": "United States" }, { "address_line_1": "32 Victoria Street", "city": "Palo Alto", "state_province_region": "California", "postal_code": "94301", "country": "United States" }, { "address_line_1": "22 Park Lane", "city": "Seattle", "state_province_region": "Washington", "postal_code": "98101", "country": "United States" }, { "address_line_1": "815 Bay Street", "city": "San Mateo", "state_province_region": "California", "postal_code": "94401", "country": "United States" }, { "address_line_1": "9 Broad Street", "city": "Redwood City", "state_province_region": "California", "postal_code": "94062", "country": "United States" }, { "address_line_1": "6921 Eastview Street", "city": "Beverly Hills", "state_province_region": "California", "postal_code": "90210", "country": "United States" }, { "address_line_1": "1416 Mission Street", "city": "Santa Cruz", "state_province_region": "California", "postal_code": "95060", "country": "United States" }, { "address_line_1": "5875 Pine Street", "city": "Monterey", "state_province_region": "California", "postal_code": "93940", "country": "United States" }, { "address_line_1": "15 Front Street", "city": "Carmel", "state_province_region": "California", "postal_code": "93923", "country": "United States" }, { "address_line_1": "1576 Pacific Avenue", "city": "Santa Rosa", "state_province_region": "California", "postal_code": "95405", "country": "United States" }, { "address_line_1": "4987 Garden Street", "city": "Springfield", "state_province_region": "Illinois", "postal_code": "62701", "country": "United States" }, { "address_line_1": "603 High Street", "city": "Madison", "state_province_region": "Wisconsin", "postal_code": "53703", "country": "United States" }, { "address_line_1": "400 Baker Street", "city": "Reno", "state_province_region": "Nevada", "postal_code": "89501", "country": "United States" }, { "address_line_1": "8421 Central Avenue", "city": "Tucson", "state_province_region": "Arizona", "postal_code": "85701", "country": "United States" }, { "address_line_1": "1467 Gentle Street", "city": "Santa Monica", "state_province_region": "California", "postal_code": "90401", "country": "United States" }, { "address_line_1": "449 Emerald Street", "city": "Orlando", "state_province_region": "Florida", "postal_code": "32801", "country": "United States" }, { "address_line_1": "352 Gold Avenue", "city": "Raleigh", "state_province_region": "North Carolina", "postal_code": "27601", "country": "United States" }, { "address_line_1": "5200 Hawley Blvd", "city": "Albuquerque", "state_province_region": "New Mexico", "postal_code": "87001", "country": "United States" }, { "address_line_1": "1478 Sunny Lane", "city": "Cleveland", "state_province_region": "Ohio", "postal_code": "44101", "country": "United States" }, { "address_line_1": "801 Cherry Circle", "city": "Honolulu", "state_province_region": "Hawaii", "postal_code": "96801", "country": "United States" }, { "address_line_1": "1265 Miles Street", "city": "Omaha", "state_province_region": "Nebraska", "postal_code": "68007", "country": "United States" }, { "address_line_1": "252 South Bend Ave", "city": "St. Louis", "state_province_region": "Missouri", "postal_code": "63101", "country": "United States" }, { "address_line_1": "762 Westward Avenue", "city": "Newark", "state_province_region": "New Jersey", "postal_code": "07101", "country": "United States" }, { "address_line_1": "9655 East Street", "city": "Fargo", "state_province_region": "North Dakota", "postal_code": "58047", "country": "United States" }, { "address_line_1": "79 Magnolia Street", "city": "Boston", "state_province_region": "Massachusetts", "postal_code": "02110", "country": "United States" }, { "address_line_1": "630 Riverside Drive", "city": "Richmond", "state_province_region": "Virginia", "postal_code": "23219", "country": "United States" }, { "address_line_1": "6103 Bluebonnet Boulevard", "city": "Baton Rouge", "state_province_region": "Louisiana", "postal_code": "70801", "country": "United States" }, { "address_line_1": "3514 Redwood Drive", "city": "Madison", "state_province_region": "Wisconsin", "postal_code": "53701", "country": "United States" }, { "address_line_1": "2605 Lake Street", "city": "Hartford", "state_province_region": "Connecticut", "postal_code": "06103", "country": "United States" }, { "address_line_1": "75 Sullivan Street", "city": "Providence", "state_province_region": "Rhode Island", "postal_code": "02903", "country": "United States" }, { "address_line_1": "4815 Broadway Street", "city": "Boise", "state_province_region": "Idaho", "postal_code": "83702", "country": "United States" }, { "address_line_1": "8759 Roy Street", "city": "Burlington", "state_province_region": "Vermont", "postal_code": "05401", "country": "United States" }, { "address_line_1": "705 Century Avenue", "city": "Pierre", "state_province_region": "South Dakota", "postal_code": "57501", "country": "United States" }, { "address_line_1": "911 East Capitol Avenue", "city": "Denver", "state_province_region": "Colorado", "postal_code": "80014", "country": "United States" } ];
randomData.languages = ["english", "spanish", "french", "german" ];
randomData.times = ["8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "11:00 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM" ];

// Takes in a | delimited string, creates and array from it, selects random element
async function returnSelectedOption(options) {
  
  let array = options.split("|");
  return array[ ( Math.floor (Math.random() * array.length) ) ];

}

// Pulls a random element from one of the arrays
async function returnRandomData(dataType) {
  
  return randomData [ dataType ] [ ( Math.floor (Math.random() * randomData[ dataType ].length) ) ];

}

async function returnRandomNumber(digits) {
  
  let rn = ("" + Math.random()).substring(2, (parseInt(digits)+2) ); 
  return parseInt(rn);  

}

async function getFutureDate(futureDays, locales, options) {
  
  let f = (locales) ? locales : undefined;
  // en-CA "2012-12-19"
  // en-US "12/19/2012"
  let o = (options) ? options : {};

  let today = new Date();
  let futureDate = new Date(today.setDate(today.getDate() + futureDays));
  
  return futureDate.toLocaleDateString(f,o);  

}

async function getPastDate(pastDays, locales, options) {
  
  let f = (locales) ? locales : undefined;
  // en-CA "2012-12-19"
  // en-US "12/19/2012"
  let o = (options) ? options : {};

  let today = new Date();
  let pastDate = new Date(today.setDate(today.getDate() - pastDays));
  
  return pastDate.toLocaleDateString(f,o);  

}

async function getTimestamp() {
  
  let now = new Date();  
  
  return now.toUTCString();  

}

async function returnRandomDynamicTemplateData(t_data) {

  let r = null;

  switch (t_data.random) {
    case "firstNames":
      r = await returnRandomData("firstNames");      
      break;
    case "lastNames":
      r = await returnRandomData("lastNames");      
      break;
    case "addresses":
      // Returns an object!  
      r = await returnRandomData("addresses");      
      break;      
    case "times":
      // Returns an object!  
      r = await returnRandomData("times");      
      break;            
    case "random_number":
      r = await returnRandomNumber(t_data.digits);       
      break;  
    case "amount":
      let n = await returnRandomNumber(t_data.digits);       
      r = `$${n.toString()}.00`;
      break;        
    case "option":
      r = await returnSelectedOption(t_data.options);       
      break;       
    case "future_date":
      r = await getFutureDate(t_data.days, t_data?.locales, t_data?.options);       
      break;       
    case "past_date":
      r = await getPastDate(t_data.days, t_data?.locales, t_data?.options);       
      break;             
    case "timestamp":
      r = await getTimestamp();       
      break;      
    case "disabled":
      r = t_data.value;
      break;             
    default:
      r = "";  
      break;
  }

  return r;
}

export  { 
  
  returnRandomDynamicTemplateData, returnRandomData, getFutureDate, getPastDate, 
  returnRandomNumber, returnSelectedOption, getTimestamp

};