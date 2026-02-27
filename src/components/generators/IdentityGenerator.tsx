import { useState, useCallback, useEffect } from 'react'
import { 
  Copy, Check, RefreshCw, Star, History, User,
  Mail, MapPin, Globe, Heart,
  Briefcase, CreditCard, Shield,
  AlertCircle
} from 'lucide-react'

// ==================== TYPES ====================
type Gender = 'male' | 'female' | 'non-binary' | 'random'
type AgeGroup = 'child' | 'teen' | 'young' | 'adult' | 'senior' | 'random'
type Nationality = 'us' | 'uk' | 'ca' | 'au' | 'in' | 'cn' | 'jp' | 'br' | 'mx' | 'de' | 'fr' | 'it' | 'es' | 'ru' | 'za' | 'random'
type Occupation = 'tech' | 'medical' | 'education' | 'business' | 'arts' | 'legal' | 'service' | 'random'

interface Identity {
  // Personal
  firstName: string
  lastName: string
  fullName: string
  gender: string
  age: number
  birthday: string
  zodiac: string
  
  // Contact
  email: string
  phone: string
  mobile: string
  
  // Location
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  fullAddress: string
  coordinates: {
    lat: number
    lng: number
  }
  
  // Online
  username: string
  domain: string
  ipAddress: string
  macAddress: string
  userAgent: string
  
  // Professional
  occupation: string
  company: string
  workEmail: string
  workPhone: string
  
  // Financial
  creditCard: {
    number: string
    type: string
    cvv: string
    expiry: string
  }
  bankAccount: string
  routingNumber: string
  
  // Physical
  height: string
  weight: string
  bloodType: string
  eyeColor: string
  hairColor: string
  
  // Security
  password: string
  securityQuestion: string
  securityAnswer: string
  
  // Metadata
  createdAt: Date
  id: string
}

interface IdentityOptions {
  gender: Gender
  ageGroup: AgeGroup
  nationality: Nationality
  occupation: Occupation
  count: number
  includeContact: boolean
  includeLocation: boolean
  includeProfessional: boolean
  includeFinancial: boolean
  includePhysical: boolean
  includeSecurity: boolean
  includeOnline: boolean
}

// ==================== CONSTANTS ====================
const FIRST_NAMES = {
  male: [
    'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
    'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Donald', 'Mark', 'Paul', 'Steven', 'Andrew', 'Kenneth',
    'Joshua', 'Kevin', 'Brian', 'George', 'Edward', 'Ronald', 'Timothy', 'Jason', 'Jeffrey', 'Ryan',
    'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon',
    'Benjamin', 'Samuel', 'Gregory', 'Frank', 'Alexander', 'Raymond', 'Patrick', 'Jack', 'Dennis', 'Jerry'
  ],
  female: [
    'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
    'Nancy', 'Lisa', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle',
    'Dorothy', 'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia',
    'Kathleen', 'Amy', 'Shirley', 'Angela', 'Helen', 'Anna', 'Brenda', 'Pamela', 'Nicole', 'Samantha',
    'Katherine', 'Emma', 'Ruth', 'Christine', 'Catherine', 'Debra', 'Rachel', 'Carolyn', 'Janet', 'Virginia'
  ],
  'non-binary': [
    'Alex', 'Jordan', 'Casey', 'Taylor', 'Morgan', 'Riley', 'Quinn', 'Avery', 'Sage', 'Peyton',
    'Skyler', 'Rowan', 'Emerson', 'Finley', 'River', 'Phoenix', 'Indigo', 'Arden', 'Blair', 'Dakota',
    'Reese', 'Kai', 'Sawyer', 'Charlie', 'Frankie', 'Stevie', 'Billie', 'Jesse', 'Marley', 'Lennon'
  ]
}

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen',
  'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson',
  'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans'
]

const COUNTRIES: Record<Nationality, {
  name: string
  flag: string
  cities: string[]
  states: string[]
  zipFormat: string
  phoneCode: string
  domains: string[]
}> = {
  us: {
    name: 'United States',
    flag: '🇺🇸',
    cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
    states: ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'GA', 'NC'],
    zipFormat: '#####',
    phoneCode: '1',
    domains: ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com']
  },
  uk: {
    name: 'United Kingdom',
    flag: '🇬🇧',
    cities: ['London', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool', 'Edinburgh', 'Leeds', 'Bristol', 'Sheffield', 'Newcastle'],
    states: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
    zipFormat: '??# #??',
    phoneCode: '44',
    domains: ['gmail.com', 'yahoo.co.uk', 'hotmail.co.uk', 'outlook.com', 'btinternet.com']
  },
  ca: {
    name: 'Canada',
    flag: '🇨🇦',
    cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton', 'Quebec City', 'Winnipeg', 'Hamilton', 'Halifax'],
    states: ['ON', 'BC', 'QC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE'],
    zipFormat: '?#? #?#',
    phoneCode: '1',
    domains: ['gmail.com', 'yahoo.ca', 'hotmail.com', 'outlook.com', 'shaw.ca']
  },
  au: {
    name: 'Australia',
    flag: '🇦🇺',
    cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Newcastle', 'Wollongong', 'Hobart'],
    states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'],
    zipFormat: '####',
    phoneCode: '61',
    domains: ['gmail.com', 'yahoo.com.au', 'hotmail.com', 'outlook.com', 'bigpond.com']
  },
  in: {
    name: 'India',
    flag: '🇮🇳',
    cities: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'],
    states: ['MH', 'DL', 'KA', 'TN', 'WB', 'TS', 'GJ', 'RJ', 'UP', 'PB'],
    zipFormat: '######',
    phoneCode: '91',
    domains: ['gmail.com', 'yahoo.co.in', 'hotmail.com', 'outlook.com', 'rediffmail.com']
  },
  cn: {
    name: 'China',
    flag: '🇨🇳',
    cities: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Wuhan', 'Xi\'an', 'Hangzhou', 'Nanjing', 'Chongqing'],
    states: ['BJ', 'SH', 'GD', 'SZ', 'SC', 'HB', 'SN', 'ZJ', 'JS', 'CQ'],
    zipFormat: '######',
    phoneCode: '86',
    domains: ['qq.com', '163.com', '126.com', 'sina.com', 'sohu.com']
  },
  jp: {
    name: 'Japan',
    flag: '🇯🇵',
    cities: ['Tokyo', 'Osaka', 'Nagoya', 'Yokohama', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Kawasaki', 'Saitama'],
    states: ['Tokyo', 'Osaka', 'Aichi', 'Kanagawa', 'Hokkaido', 'Fukuoka', 'Hyogo', 'Kyoto', 'Saitama', 'Chiba'],
    zipFormat: '###-####',
    phoneCode: '81',
    domains: ['gmail.com', 'yahoo.co.jp', 'hotmail.co.jp', 'outlook.jp', 'icloud.com']
  },
  br: {
    name: 'Brazil',
    flag: '🇧🇷',
    cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre'],
    states: ['SP', 'RJ', 'DF', 'BA', 'CE', 'MG', 'AM', 'PR', 'PE', 'RS'],
    zipFormat: '#####-###',
    phoneCode: '55',
    domains: ['gmail.com', 'yahoo.com.br', 'hotmail.com', 'outlook.com', 'bol.com.br']
  },
  mx: {
    name: 'Mexico',
    flag: '🇲🇽',
    cities: ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Zapopan', 'Cancún', 'Mérida'],
    states: ['CDMX', 'JAL', 'NLE', 'PUE', 'BCN', 'GUA', 'CHH', 'MEX', 'ROO', 'YUC'],
    zipFormat: '#####',
    phoneCode: '52',
    domains: ['gmail.com', 'yahoo.com.mx', 'hotmail.com', 'outlook.com', 'prodigy.net.mx']
  },
  de: {
    name: 'Germany',
    flag: '🇩🇪',
    cities: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen'],
    states: ['BE', 'HH', 'BY', 'NW', 'HE', 'BW', 'SN', 'NI', 'RP', 'SL'],
    zipFormat: '#####',
    phoneCode: '49',
    domains: ['gmail.com', 'yahoo.de', 'hotmail.de', 'outlook.de', 'web.de']
  },
  fr: {
    name: 'France',
    flag: '🇫🇷',
    cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'],
    states: ['75', '13', '69', '31', '06', '44', '67', '34', '33', '59'],
    zipFormat: '#####',
    phoneCode: '33',
    domains: ['gmail.com', 'yahoo.fr', 'hotmail.fr', 'orange.fr', 'free.fr']
  },
  it: {
    name: 'Italy',
    flag: '🇮🇹',
    cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania'],
    states: ['RM', 'MI', 'NA', 'TO', 'PA', 'GE', 'BO', 'FI', 'BA', 'CT'],
    zipFormat: '#####',
    phoneCode: '39',
    domains: ['gmail.com', 'yahoo.it', 'hotmail.it', 'libero.it', 'tim.it']
  },
  es: {
    name: 'Spain',
    flag: '🇪🇸',
    cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Bilbao', 'Alicante'],
    states: ['M', 'B', 'V', 'SE', 'Z', 'MA', 'MU', 'PM', 'BI', 'A'],
    zipFormat: '#####',
    phoneCode: '34',
    domains: ['gmail.com', 'yahoo.es', 'hotmail.com', 'outlook.es', 'movistar.es']
  },
  ru: {
    name: 'Russia',
    flag: '🇷🇺',
    cities: ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Kazan', 'Nizhny Novgorod', 'Chelyabinsk', 'Samara', 'Omsk', 'Rostov-on-Don'],
    states: ['MOW', 'SPE', 'NVS', 'SVE', 'TA', 'NIZ', 'CHE', 'SAM', 'OMS', 'ROS'],
    zipFormat: '######',
    phoneCode: '7',
    domains: ['gmail.com', 'yandex.ru', 'mail.ru', 'rambler.ru', 'bk.ru']
  },
  za: {
    name: 'South Africa',
    flag: '🇿🇦',
    cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'Pietermaritzburg', 'East London', 'Nelspruit', 'Kimberley'],
    states: ['GP', 'WC', 'KZN', 'EC', 'FS', 'MP', 'LP', 'NW', 'NC'],
    zipFormat: '####',
    phoneCode: '27',
    domains: ['gmail.com', 'yahoo.co.za', 'hotmail.com', 'outlook.com', 'mweb.co.za']
  },
  random: {
    name: 'Random',
    flag: '🌍',
    cities: ['Global City'],
    states: ['Global State'],
    zipFormat: '#####',
    phoneCode: '1',
    domains: ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
  }
}

const OCCUPATIONS = {
  tech: ['Software Engineer', 'Data Scientist', 'DevOps Engineer', 'Product Manager', 'UX Designer', 'Systems Architect', 'Network Administrator', 'Security Analyst', 'Database Administrator', 'QA Engineer'],
  medical: ['Doctor', 'Nurse', 'Surgeon', 'Dentist', 'Pharmacist', 'Physical Therapist', 'Radiologist', 'Anesthesiologist', 'Pediatrician', 'Cardiologist'],
  education: ['Teacher', 'Professor', 'Principal', 'Guidance Counselor', 'Librarian', 'Teaching Assistant', 'Curriculum Developer', 'School Administrator', 'Tutor', 'Researcher'],
  business: ['CEO', 'CFO', 'Marketing Director', 'Sales Manager', 'Business Analyst', 'Consultant', 'Accountant', 'Financial Advisor', 'HR Manager', 'Operations Director'],
  arts: ['Artist', 'Musician', 'Actor', 'Writer', 'Photographer', 'Graphic Designer', 'Filmmaker', 'Architect', 'Dancer', 'Sculptor'],
  legal: ['Lawyer', 'Judge', 'Paralegal', 'Legal Secretary', 'Attorney', 'Solicitor', 'Barrister', 'Legal Consultant', 'Compliance Officer', 'Mediator'],
  service: ['Chef', 'Waiter', 'Barista', 'Hotel Manager', 'Flight Attendant', 'Tour Guide', 'Event Planner', 'Fitness Trainer', 'Hairdresser', 'Massage Therapist'],
  random: []
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const EYE_COLORS = ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber']
const HAIR_COLORS = ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'White', 'Auburn', 'Chestnut']


const STREET_NAMES = [
  'Main St', 'Oak Ave', 'Maple Rd', 'Pine Ln', 'Cedar Blvd', 'Washington Ave', 'Park St', 'Lake Dr',
  'Hill St', 'River Rd', 'Sunset Blvd', 'Broadway', 'Highland Ave', 'Church St', 'Market St', 'Elm St',
  'Spring St', 'Chestnut St', 'Walnut St', 'Pleasant St', 'School St', 'Center St', 'Union St', 'Front St'
]

const COMPANIES = [
  'TechCorp', 'Innovate Inc', 'Global Solutions', 'Digital Dynamics', 'Creative Minds', 'Future Systems',
  'Advanced Technologies', 'Strategic Partners', 'Enterprise Solutions', 'Alpha Industries', 'Omega Corp',
  'Phoenix Group', 'Nova Systems', 'Vertex Solutions', 'Prime Resources', 'Elite Services', 'Peak Performance'
]

// ==================== UTILITY FUNCTIONS ====================
function generateIdentity(options: IdentityOptions): Identity {
  const nationality = options.nationality === 'random' 
    ? Object.keys(COUNTRIES).filter(c => c !== 'random')[Math.floor(Math.random() * (Object.keys(COUNTRIES).length - 1))] as Nationality
    : options.nationality
  const country = COUNTRIES[nationality]
  
  // Gender
  let gender = options.gender
  if (gender === 'random') {
    const genders: Gender[] = ['male', 'female', 'non-binary']
    gender = genders[Math.floor(Math.random() * genders.length)]
  }
  
  // Name
  const firstName = gender === 'male' 
    ? FIRST_NAMES.male[Math.floor(Math.random() * FIRST_NAMES.male.length)]
    : gender === 'female'
    ? FIRST_NAMES.female[Math.floor(Math.random() * FIRST_NAMES.female.length)]
    : FIRST_NAMES['non-binary'][Math.floor(Math.random() * FIRST_NAMES['non-binary'].length)]
  
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  const fullName = `${firstName} ${lastName}`
  
  // Age
  let age = 0
  if (options.ageGroup === 'random') {
    age = Math.floor(Math.random() * 70) + 18
  } else {
    const ageRanges = {
      child: [5, 12],
      teen: [13, 19],
      young: [20, 30],
      adult: [31, 50],
      senior: [51, 80]
    }
    const range = ageRanges[options.ageGroup]
    age = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0]
  }
  
  // Birthday
  const birthday = new Date()
  birthday.setFullYear(birthday.getFullYear() - age)
  birthday.setMonth(Math.floor(Math.random() * 12))
  birthday.setDate(Math.floor(Math.random() * 28) + 1)
  
  const birthdayStr = birthday.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  // Zodiac
  const month = birthday.getMonth() + 1
  const day = birthday.getDate()
  let zodiac = ''
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) zodiac = 'Aries'
  else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) zodiac = 'Taurus'
  else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) zodiac = 'Gemini'
  else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) zodiac = 'Cancer'
  else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) zodiac = 'Leo'
  else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) zodiac = 'Virgo'
  else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) zodiac = 'Libra'
  else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) zodiac = 'Scorpio'
  else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) zodiac = 'Sagittarius'
  else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) zodiac = 'Capricorn'
  else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) zodiac = 'Aquarius'
  else zodiac = 'Pisces'
  
  // Location
  const city = country.cities[Math.floor(Math.random() * country.cities.length)]
  const state = country.states[Math.floor(Math.random() * country.states.length)]
  const zipCode = generateZipCode(country.zipFormat)
  const street = `${Math.floor(Math.random() * 9999) + 100} ${STREET_NAMES[Math.floor(Math.random() * STREET_NAMES.length)]}`
  const fullAddress = `${street}, ${city}, ${state} ${zipCode}, ${country.name}`
  
  // Coordinates (approximate)
  const coordinates = {
    lat: (Math.random() * 180 - 90),
    lng: (Math.random() * 360 - 180)
  }
  
  // Contact
  const domain = country.domains[Math.floor(Math.random() * country.domains.length)]
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@${domain}`
  const phone = `+${country.phoneCode} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`
  const mobile = `+${country.phoneCode} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`
  
  // Online
  const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}`
  const ipAddress = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
  const macAddress = Array(6).fill(0).map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':')
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  
  // Professional
  const occupationType = options.occupation === 'random'
    ? Object.keys(OCCUPATIONS)[Math.floor(Math.random() * Object.keys(OCCUPATIONS).length)] as Occupation
    : options.occupation
  const occupations = OCCUPATIONS[occupationType]
  const occupation = occupations[Math.floor(Math.random() * occupations.length)]
  const company = COMPANIES[Math.floor(Math.random() * COMPANIES.length)]
  const workEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s/g, '')}.com`
  const workPhone = `+${country.phoneCode} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`
  
  // Financial
  const creditCard = {
    number: `${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000}`,
    type: ['Visa', 'Mastercard', 'Amex', 'Discover'][Math.floor(Math.random() * 4)],
    cvv: Math.floor(Math.random() * 900 + 100).toString(),
    expiry: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/${String(Math.floor(Math.random() * 5) + 24)}`
  }
  const bankAccount = Array(10).fill(0).map(() => Math.floor(Math.random() * 10)).join('')
  const routingNumber = Array(9).fill(0).map(() => Math.floor(Math.random() * 10)).join('')
  
  // Physical
  const height = `${Math.floor(Math.random() * 30) + 150} cm`
  const weight = `${Math.floor(Math.random() * 50) + 50} kg`
  const bloodType = BLOOD_TYPES[Math.floor(Math.random() * BLOOD_TYPES.length)]
  const eyeColor = EYE_COLORS[Math.floor(Math.random() * EYE_COLORS.length)]
  const hairColor = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)]
  
  // Security
  const password = `${firstName}${lastName}${Math.floor(Math.random() * 999)}!`
  const securityQuestion = 'What was your first pet\'s name?'
  const securityAnswer = ['Fluffy', 'Max', 'Bella', 'Charlie', 'Rocky'][Math.floor(Math.random() * 5)]
  
  return {
    firstName, lastName, fullName, gender, age, birthday: birthdayStr, zodiac,
    email, phone, mobile,
    street, city, state, zipCode, country: country.name, fullAddress, coordinates,
    username, domain, ipAddress, macAddress, userAgent,
    occupation, company, workEmail, workPhone,
    creditCard, bankAccount, routingNumber,
    height, weight, bloodType, eyeColor, hairColor,
    password, securityQuestion, securityAnswer,
    createdAt: new Date(),
    id: Math.random().toString(36).substring(2, 15)
  }
}

function generateZipCode(format: string): string {
  let result = ''
  for (let i = 0; i < format.length; i++) {
    if (format[i] === '#') {
      result += Math.floor(Math.random() * 10).toString()
    } else if (format[i] === '?') {
      result += String.fromCharCode(65 + Math.floor(Math.random() * 26))
    } else {
      result += format[i]
    }
  }
  return result
}

function generateMultipleIdentities(options: IdentityOptions): Identity[] {
  const identities: Identity[] = []
  for (let i = 0; i < options.count; i++) {
    identities.push(generateIdentity(options))
  }
  return identities
}

// ==================== MAIN COMPONENT ====================
export default function IdentityGenerator() {
  const [options, setOptions] = useState<IdentityOptions>({
    gender: 'random',
    ageGroup: 'adult',
    nationality: 'us',
    occupation: 'random',
    count: 1,
    includeContact: true,
    includeLocation: true,
    includeProfessional: true,
    includeFinancial: false,
    includePhysical: true,
    includeSecurity: false,
    includeOnline: true
  })
  const [identities, setIdentities] = useState<Identity[]>([])
  const [currentIdentity, setCurrentIdentity] = useState<Identity | null>(null)
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<Identity[]>([])
  const [favorites, setFavorites] = useState<Identity[]>([])
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({})

  // Load from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('identityHistory')
    if (savedHistory) setHistory(JSON.parse(savedHistory))
    const savedFavorites = localStorage.getItem('identityFavorites')
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
  }, [])

  const generate = useCallback(() => {
    const newIdentities = generateMultipleIdentities(options)
    setIdentities(newIdentities)
    setCurrentIdentity(newIdentities[0])
    setCopied(false)
    
    // Update history (only first one)
    if (newIdentities.length > 0) {
      setHistory(prev => {
        const newHistory = [newIdentities[0], ...prev.slice(0, 9)]
        localStorage.setItem('identityHistory', JSON.stringify(newHistory))
        return newHistory
      })
    }
  }, [options])

  useEffect(() => {
    generate()
  }, [options])

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyAllToClipboard = async () => {
    if (!currentIdentity) return
    
    const sections = []
    
    sections.push('=== PERSONAL INFORMATION ===')
    sections.push(`Name: ${currentIdentity.fullName}`)
    sections.push(`Gender: ${currentIdentity.gender}`)
    sections.push(`Age: ${currentIdentity.age}`)
    sections.push(`Birthday: ${currentIdentity.birthday}`)
    sections.push(`Zodiac: ${currentIdentity.zodiac}`)
    
    if (options.includeContact) {
      sections.push('\n=== CONTACT ===')
      sections.push(`Email: ${currentIdentity.email}`)
      sections.push(`Phone: ${currentIdentity.phone}`)
      sections.push(`Mobile: ${currentIdentity.mobile}`)
    }
    
    if (options.includeLocation) {
      sections.push('\n=== LOCATION ===')
      sections.push(`Address: ${currentIdentity.fullAddress}`)
      sections.push(`City: ${currentIdentity.city}`)
      sections.push(`State: ${currentIdentity.state}`)
      sections.push(`Zip: ${currentIdentity.zipCode}`)
      sections.push(`Country: ${currentIdentity.country}`)
    }
    
    if (options.includeProfessional) {
      sections.push('\n=== PROFESSIONAL ===')
      sections.push(`Occupation: ${currentIdentity.occupation}`)
      sections.push(`Company: ${currentIdentity.company}`)
      sections.push(`Work Email: ${currentIdentity.workEmail}`)
      sections.push(`Work Phone: ${currentIdentity.workPhone}`)
    }
    
    if (options.includeOnline) {
      sections.push('\n=== ONLINE ===')
      sections.push(`Username: ${currentIdentity.username}`)
      sections.push(`IP Address: ${currentIdentity.ipAddress}`)
      sections.push(`MAC Address: ${currentIdentity.macAddress}`)
    }
    
    if (options.includePhysical) {
      sections.push('\n=== PHYSICAL ===')
      sections.push(`Height: ${currentIdentity.height}`)
      sections.push(`Weight: ${currentIdentity.weight}`)
      sections.push(`Blood Type: ${currentIdentity.bloodType}`)
      sections.push(`Eyes: ${currentIdentity.eyeColor}`)
      sections.push(`Hair: ${currentIdentity.hairColor}`)
    }
    
    if (options.includeFinancial) {
      sections.push('\n=== FINANCIAL ===')
      sections.push(`Card: ${currentIdentity.creditCard.number} (${currentIdentity.creditCard.type})`)
      sections.push(`CVV: ${currentIdentity.creditCard.cvv}`)
      sections.push(`Expiry: ${currentIdentity.creditCard.expiry}`)
      sections.push(`Bank Account: ${currentIdentity.bankAccount}`)
      sections.push(`Routing: ${currentIdentity.routingNumber}`)
    }
    
    if (options.includeSecurity) {
      sections.push('\n=== SECURITY ===')
      sections.push(`Password: ${currentIdentity.password}`)
      sections.push(`Security Question: ${currentIdentity.securityQuestion}`)
      sections.push(`Answer: ${currentIdentity.securityAnswer}`)
    }
    
    await navigator.clipboard.writeText(sections.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleFavorite = (identity: Identity) => {
    if (favorites.some(f => f.id === identity.id)) {
      const newFavorites = favorites.filter(f => f.id !== identity.id)
      setFavorites(newFavorites)
      localStorage.setItem('identityFavorites', JSON.stringify(newFavorites))
    } else {
      const newFavorites = [identity, ...favorites.slice(0, 9)]
      setFavorites(newFavorites)
      localStorage.setItem('identityFavorites', JSON.stringify(newFavorites))
    }
  }

  const toggleSection = (identityId: string, section: string) => {
    setShowDetails(prev => ({
      ...prev,
      [`${identityId}-${section}`]: !prev[`${identityId}-${section}`]
    }))
  }

  const updateOption = <K extends keyof IdentityOptions>(key: K, value: IdentityOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            Identity Generator
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Generate complete fake identities for testing and development
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-violet-500/10 rounded-full border border-violet-500/30">
            <span className="text-xs text-violet-400">
              {COUNTRIES[options.nationality].flag} {COUNTRIES[options.nationality].name}
            </span>
          </div>
        </div>
      </div>

      {/* Main Display */}
      {currentIdentity && (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
          {/* Identity Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
              <User size={40} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{currentIdentity.fullName}</h3>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span>{currentIdentity.gender}</span>
                <span>•</span>
                <span>{currentIdentity.age} years</span>
                <span>•</span>
                <span>{currentIdentity.occupation}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={generate}
                className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition group"
                title="Generate new"
              >
                <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
              </button>
              <button 
                onClick={copyAllToClipboard}
                className="p-3 bg-violet-500 text-black rounded-lg hover:bg-violet-400 transition"
                title="Copy all details"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
              <button 
                onClick={() => toggleFavorite(currentIdentity)}
                className={`p-3 rounded-lg transition ${
                  favorites.some(f => f.id === currentIdentity.id)
                    ? 'bg-yellow-500 text-black' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title="Add to favorites"
              >
                <Star size={20} fill={favorites.some(f => f.id === currentIdentity.id) ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* Identity Sections */}
          <div className="space-y-4">
            {/* Personal Info */}
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(currentIdentity.id, 'personal')}
                className="w-full px-4 py-3 bg-gray-900/50 flex items-center justify-between hover:bg-gray-800 transition"
              >
                <div className="flex items-center gap-2">
                  <User size={16} className="text-violet-400" />
                  <span className="font-medium">Personal Information</span>
                </div>
                <span className="text-gray-500">
                  {showDetails[`${currentIdentity.id}-personal`] ? '▼' : '▶'}
                </span>
              </button>
              
              {showDetails[`${currentIdentity.id}-personal`] && (
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">First Name</div>
                    <div className="text-sm">{currentIdentity.firstName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Last Name</div>
                    <div className="text-sm">{currentIdentity.lastName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Birthday</div>
                    <div className="text-sm">{currentIdentity.birthday}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Zodiac</div>
                    <div className="text-sm">{currentIdentity.zodiac}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Contact */}
            {options.includeContact && (
              <div className="border border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(currentIdentity.id, 'contact')}
                  className="w-full px-4 py-3 bg-gray-900/50 flex items-center justify-between hover:bg-gray-800 transition"
                >
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-violet-400" />
                    <span className="font-medium">Contact Information</span>
                  </div>
                  <span className="text-gray-500">
                    {showDetails[`${currentIdentity.id}-contact`] ? '▼' : '▶'}
                  </span>
                </button>
                
                {showDetails[`${currentIdentity.id}-contact`] && (
                  <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Email</div>
                      <div className="text-sm">{currentIdentity.email}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Phone</div>
                      <div className="text-sm">{currentIdentity.phone}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Mobile</div>
                      <div className="text-sm">{currentIdentity.mobile}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Location */}
            {options.includeLocation && (
              <div className="border border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(currentIdentity.id, 'location')}
                  className="w-full px-4 py-3 bg-gray-900/50 flex items-center justify-between hover:bg-gray-800 transition"
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-violet-400" />
                    <span className="font-medium">Location</span>
                  </div>
                  <span className="text-gray-500">
                    {showDetails[`${currentIdentity.id}-location`] ? '▼' : '▶'}
                  </span>
                </button>
                
                {showDetails[`${currentIdentity.id}-location`] && (
                  <div className="p-4">
                    <div className="text-sm mb-2">{currentIdentity.fullAddress}</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-gray-500">City</div>
                        <div className="text-sm">{currentIdentity.city}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">State</div>
                        <div className="text-sm">{currentIdentity.state}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Zip</div>
                        <div className="text-sm">{currentIdentity.zipCode}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Country</div>
                        <div className="text-sm">{currentIdentity.country}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Professional */}
            {options.includeProfessional && (
              <div className="border border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(currentIdentity.id, 'professional')}
                  className="w-full px-4 py-3 bg-gray-900/50 flex items-center justify-between hover:bg-gray-800 transition"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-violet-400" />
                    <span className="font-medium">Professional</span>
                  </div>
                  <span className="text-gray-500">
                    {showDetails[`${currentIdentity.id}-professional`] ? '▼' : '▶'}
                  </span>
                </button>
                
                {showDetails[`${currentIdentity.id}-professional`] && (
                  <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Occupation</div>
                      <div className="text-sm">{currentIdentity.occupation}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Company</div>
                      <div className="text-sm">{currentIdentity.company}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Work Email</div>
                      <div className="text-sm">{currentIdentity.workEmail}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Physical */}
            {options.includePhysical && (
              <div className="border border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(currentIdentity.id, 'physical')}
                  className="w-full px-4 py-3 bg-gray-900/50 flex items-center justify-between hover:bg-gray-800 transition"
                >
                  <div className="flex items-center gap-2">
                    <Heart size={16} className="text-violet-400" />
                    <span className="font-medium">Physical Attributes</span>
                  </div>
                  <span className="text-gray-500">
                    {showDetails[`${currentIdentity.id}-physical`] ? '▼' : '▶'}
                  </span>
                </button>
                
                {showDetails[`${currentIdentity.id}-physical`] && (
                  <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Height</div>
                      <div className="text-sm">{currentIdentity.height}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Weight</div>
                      <div className="text-sm">{currentIdentity.weight}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Blood Type</div>
                      <div className="text-sm">{currentIdentity.bloodType}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Eye Color</div>
                      <div className="text-sm">{currentIdentity.eyeColor}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Hair Color</div>
                      <div className="text-sm">{currentIdentity.hairColor}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Online */}
            {options.includeOnline && (
              <div className="border border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(currentIdentity.id, 'online')}
                  className="w-full px-4 py-3 bg-gray-900/50 flex items-center justify-between hover:bg-gray-800 transition"
                >
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-violet-400" />
                    <span className="font-medium">Online Presence</span>
                  </div>
                  <span className="text-gray-500">
                    {showDetails[`${currentIdentity.id}-online`] ? '▼' : '▶'}
                  </span>
                </button>
                
                {showDetails[`${currentIdentity.id}-online`] && (
                  <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Username</div>
                      <div className="text-sm">{currentIdentity.username}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">IP Address</div>
                      <div className="text-sm">{currentIdentity.ipAddress}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">MAC Address</div>
                      <div className="text-sm">{currentIdentity.macAddress}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Financial */}
            {options.includeFinancial && (
              <div className="border border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(currentIdentity.id, 'financial')}
                  className="w-full px-4 py-3 bg-gray-900/50 flex items-center justify-between hover:bg-gray-800 transition"
                >
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-violet-400" />
                    <span className="font-medium">Financial</span>
                  </div>
                  <span className="text-gray-500">
                    {showDetails[`${currentIdentity.id}-financial`] ? '▼' : '▶'}
                  </span>
                </button>
                
                {showDetails[`${currentIdentity.id}-financial`] && (
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="text-xs text-gray-500">Credit Card</div>
                      <div className="text-sm">{currentIdentity.creditCard.number}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {currentIdentity.creditCard.type} · CVV: {currentIdentity.creditCard.cvv} · Exp: {currentIdentity.creditCard.expiry}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500">Bank Account</div>
                        <div className="text-sm">{currentIdentity.bankAccount}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Routing Number</div>
                        <div className="text-sm">{currentIdentity.routingNumber}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Security */}
            {options.includeSecurity && (
              <div className="border border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(currentIdentity.id, 'security')}
                  className="w-full px-4 py-3 bg-gray-900/50 flex items-center justify-between hover:bg-gray-800 transition"
                >
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-violet-400" />
                    <span className="font-medium">Security</span>
                  </div>
                  <span className="text-gray-500">
                    {showDetails[`${currentIdentity.id}-security`] ? '▼' : '▶'}
                  </span>
                </button>
                
                {showDetails[`${currentIdentity.id}-security`] && (
                  <div className="p-4 space-y-2">
                    <div>
                      <div className="text-xs text-gray-500">Password</div>
                      <div className="text-sm font-mono">{currentIdentity.password}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Security Question</div>
                      <div className="text-sm">{currentIdentity.securityQuestion}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Answer</div>
                      <div className="text-sm">{currentIdentity.securityAnswer}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Multiple Identities (if count > 1) */}
      {identities.length > 1 && (
        <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-3">All Generated Identities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {identities.map((identity, _index) => (
              <button
                key={identity.id}
                onClick={() => setCurrentIdentity(identity)}
                className={`p-3 rounded-lg text-left transition ${
                  currentIdentity?.id === identity.id
                    ? 'bg-violet-500/20 border border-violet-500'
                    : 'bg-gray-700/50 border border-gray-600 hover:bg-gray-700'
                }`}
              >
                <div className="font-medium">{identity.fullName}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {identity.age} · {identity.occupation}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
        {/* Basic Options */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
            <select
              value={options.gender}
              onChange={(e) => updateOption('gender', e.target.value as Gender)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-violet-500"
            >
              <option value="random">Random</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Age Group</label>
            <select
              value={options.ageGroup}
              onChange={(e) => updateOption('ageGroup', e.target.value as AgeGroup)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-violet-500"
            >
              <option value="random">Random</option>
              <option value="child">Child (5-12)</option>
              <option value="teen">Teen (13-19)</option>
              <option value="young">Young Adult (20-30)</option>
              <option value="adult">Adult (31-50)</option>
              <option value="senior">Senior (51-80)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nationality</label>
            <select
              value={options.nationality}
              onChange={(e) => updateOption('nationality', e.target.value as Nationality)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-violet-500"
            >
              {Object.keys(COUNTRIES).map(country => (
                <option key={country} value={country}>
                  {COUNTRIES[country as Nationality].flag} {COUNTRIES[country as Nationality].name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Occupation</label>
            <select
              value={options.occupation}
              onChange={(e) => updateOption('occupation', e.target.value as Occupation)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-violet-500"
            >
              <option value="random">Random</option>
              <option value="tech">Technology</option>
              <option value="medical">Medical</option>
              <option value="education">Education</option>
              <option value="business">Business</option>
              <option value="arts">Arts</option>
              <option value="legal">Legal</option>
              <option value="service">Service</option>
            </select>
          </div>
        </div>

        {/* Count & Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Number of Identities</label>
            <input
              type="number"
              min={1}
              max={10}
              value={options.count}
              onChange={(e) => updateOption('count', parseInt(e.target.value))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Include Sections</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={options.includeContact}
                  onChange={(e) => updateOption('includeContact', e.target.checked)}
                  className="w-3 h-3 accent-violet-500"
                />
                <span>Contact</span>
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={options.includeLocation}
                  onChange={(e) => updateOption('includeLocation', e.target.checked)}
                  className="w-3 h-3 accent-violet-500"
                />
                <span>Location</span>
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={options.includeProfessional}
                  onChange={(e) => updateOption('includeProfessional', e.target.checked)}
                  className="w-3 h-3 accent-violet-500"
                />
                <span>Professional</span>
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={options.includePhysical}
                  onChange={(e) => updateOption('includePhysical', e.target.checked)}
                  className="w-3 h-3 accent-violet-500"
                />
                <span>Physical</span>
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={options.includeOnline}
                  onChange={(e) => updateOption('includeOnline', e.target.checked)}
                  className="w-3 h-3 accent-violet-500"
                />
                <span>Online</span>
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={options.includeFinancial}
                  onChange={(e) => updateOption('includeFinancial', e.target.checked)}
                  className="w-3 h-3 accent-violet-500"
                />
                <span>Financial</span>
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={options.includeSecurity}
                  onChange={(e) => updateOption('includeSecurity', e.target.checked)}
                  className="w-3 h-3 accent-violet-500"
                />
                <span>Security</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* History & Favorites */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {history.length > 0 && (
          <div className="bg-gray-800/30 backdrop-blur border border-gray-700 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <History size={14} />
              Recently Generated
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {history.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg group">
                  <div>
                    <div className="text-sm font-medium">{item.fullName}</div>
                    <div className="text-xs text-gray-500">
                      {item.age} · {item.country}
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.fullName)}
                    className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-gray-600 rounded"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {favorites.length > 0 && (
          <div className="bg-gray-800/30 backdrop-blur border border-gray-700 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <Star size={14} className="text-yellow-400" />
              Favorite Identities
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {favorites.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg group">
                  <div>
                    <div className="text-sm font-medium">{item.fullName}</div>
                    <div className="text-xs text-gray-500">
                      {item.age} · {item.country}
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.fullName)}
                    className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-gray-600 rounded"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-500">Identities Generated</div>
          <div className="text-xl font-bold text-white">{history.length}</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-500">Favorites</div>
          <div className="text-xl font-bold text-white">{favorites.length}</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-500">Countries</div>
          <div className="text-xl font-bold text-white">
            {new Set(history.map(h => h.country)).size}
          </div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-500">Avg Age</div>
          <div className="text-xl font-bold text-white">
            {history.length > 0
              ? Math.round(history.reduce((acc, h) => acc + h.age, 0) / history.length)
              : 0}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="text-violet-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-violet-400 mb-1">For Testing Purposes Only</h3>
            <p className="text-xs text-gray-400">
              These identities are randomly generated and do not represent real people. 
              They are intended for development, testing, and demonstration purposes only. 
              Do not use for illegal activities or identity fraud.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

