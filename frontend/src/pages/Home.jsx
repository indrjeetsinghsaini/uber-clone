import React, { useEffect, useRef, useState, useContext } from 'react'
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import axios from 'axios';
import 'remixicon/fonts/remixicon.css'
// Assuming these component imports resolve correctly within your project structure
import LocationSearchPanel from '../components/LocationSearchPanel';
import VehiclePanel from '../components/VehiclePanel';
import ConfirmRide from '../components/ConfirmRide';
import LookingForDriver from '../components/LookingForDriver';
import WaitingForDriver from '../components/WaitingForDriver';
import { SocketContext } from '../context/SocketContext';
import { UserDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import LiveTracking from '../components/LiveTracking';

// Hardcoding the BASE_URL to prevent environment variable issues
const BASE_URL = 'https://uber-clone-production-8e3f.up.railway.app'; 

const Home = () => {
    const [ pickup, setPickup ] = useState('')
    const [ destination, setDestination ] = useState('')
    const [ panelOpen, setPanelOpen ] = useState(false)
    
    // --- State for Map/Coordinate Data (New additions for map) ---
    const [ pickupCoords, setPickupCoords ] = useState(null) // { lat: number, lng: number }
    const [ destinationCoords, setDestinationCoords ] = useState(null) // { lat: number, lng: number }
    const [ directionsResponse, setDirectionsResponse ] = useState(null) // Google Maps directions result
    // -----------------------------------------------------------

    const vehiclePanelRef = useRef(null)
    const confirmRidePanelRef = useRef(null)
    const vehicleFoundRef = useRef(null)
    const waitingForDriverRef = useRef(null)
    const panelRef = useRef(null)
    const panelCloseRef = useRef(null)
    
    const [ vehiclePanel, setVehiclePanel ] = useState(false)
    const [ confirmRidePanel, setConfirmRidePanel ] = useState(false)
    const [ vehicleFound, setVehicleFound ] = useState(false)
    const [ waitingForDriver, setWaitingForDriver ] = useState(false)
    const [ pickupSuggestions, setPickupSuggestions ] = useState([])
    const [ destinationSuggestions, setDestinationSuggestions ] = useState([])
    const [ activeField, setActiveField ] = useState(null)
    const [ fare, setFare ] = useState({})
    const [ vehicleType, setVehicleType ] = useState(null)
    const [ ride, setRide ] = useState(null)

    const navigate = useNavigate()

    const { socket } = useContext(SocketContext)
    const { user } = useContext(UserDataContext)

    useEffect(() => {
        if (user?._id && socket) {
            socket.emit("join", { userType: "user", userId: user._id })
        }
    }, [ user, socket ])

    // Socket listeners for ride lifecycle
    socket?.on('ride-confirmed', ride => {
        setVehicleFound(false)
        setWaitingForDriver(true)
        setRide(ride)
    })

    socket?.on('ride-started', ride => {
        setWaitingForDriver(false)
        navigate('/riding', { state: { ride } }) 
    })


    const handlePickupChange = async (e) => {
        setPickup(e.target.value)
        try {
            // API URL FIX
            const response = await axios.get(`${BASE_URL}/maps/get-suggestions`, {
                params: { input: e.target.value },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            setPickupSuggestions(response.data)
        } catch(error) {
             console.error("Error fetching pickup suggestions:", error)
        }
    }

    const handleDestinationChange = async (e) => {
        setDestination(e.target.value)
        try {
            // API URL FIX
            const response = await axios.get(`${BASE_URL}/maps/get-suggestions`, {
                params: { input: e.target.value },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            setDestinationSuggestions(response.data)
        } catch(error) {
            console.error("Error fetching destination suggestions:", error)
        }
    }

    const submitHandler = (e) => {
        e.preventDefault()
    }

    // --- GSAP Animation Hooks (Logic remains the same) ---
    useGSAP(function () {
        if (panelOpen) {
            gsap.to(panelRef.current, { height: '70%', padding: 24 })
            gsap.to(panelCloseRef.current, { opacity: 1 })
        } else {
            gsap.to(panelRef.current, { height: '0%', padding: 0 })
            gsap.to(panelCloseRef.current, { opacity: 0 })
        }
    }, [ panelOpen ])

    useGSAP(function () {
        if (vehiclePanel) {
            gsap.to(vehiclePanelRef.current, { transform: 'translateY(0)' })
        } else {
            gsap.to(vehiclePanelRef.current, { transform: 'translateY(100%)' })
        }
    }, [ vehiclePanel ])

    useGSAP(function () {
        if (confirmRidePanel) {
            gsap.to(confirmRidePanelRef.current, { transform: 'translateY(0)' })
        } else {
            gsap.to(confirmRidePanelRef.current, { transform: 'translateY(100%)' })
        }
    }, [ confirmRidePanel ])

    useGSAP(function () {
        if (vehicleFound) {
            gsap.to(vehicleFoundRef.current, { transform: 'translateY(0)' })
        } else {
            gsap.to(vehicleFoundRef.current, { transform: 'translateY(100%)' })
        }
    }, [ vehicleFound ])

    useGSAP(function () {
        if (waitingForDriver) {
            gsap.to(waitingForDriverRef.current, { 
                transform: 'translateY(0)',
                bottom: '0', 
            })
        } else {
            gsap.to(waitingForDriverRef.current, { 
                transform: 'translateY(100%)',
                bottom: '-100%',
            })
        }
    }, [ waitingForDriver ])
    // --- End GSAP Animation Hooks ---


    async function findTrip() {
        setVehiclePanel(true)
        setPanelOpen(false)

        try {
            // API URL FIX
            const response = await axios.get(`${BASE_URL}/rides/get-fare`, {
                params: { pickup, destination },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })

            setFare(response.data)
            
            // Extract map data needed for LiveTracking component
            const { pickupLat, pickupLng, destLat, destLng, directions } = response.data.tripDetails;

            setPickupCoords({ lat: pickupLat, lng: pickupLng });
            setDestinationCoords({ lat: destLat, lng: destLng });
            setDirectionsResponse(directions); // Pass the raw directions response for drawing the route

        } catch(error) {
            console.error("Error finding trip/fare:", error)
        }
    }

    async function createRide() {
        try {
            // API URL FIX
            const response = await axios.post(`${BASE_URL}/rides/create`, {
                pickup,
                destination,
                vehicleType
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (response.status === 201) {
                setConfirmRidePanel(false);
                setVehicleFound(true); // Triggers LookingForDriver component
            }

        } catch(error) {
            console.error("Error creating ride:", error)
        }
    }

    return (
        <div className='h-screen relative overflow-hidden'>
            <img className='w-16 absolute left-5 top-5 z-10' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber Logo" />
            
            {/* Map Component (LiveTracking) */}
            <div className='h-screen w-screen absolute top-0'>
                <LiveTracking 
                    pickup={pickupCoords}
                    destination={destinationCoords}
                    directionsResponse={directionsResponse}
                    ride={ride} // For driver/rider location tracking
                />
            </div>

            {/* Main Search Panel - Remains at 30% height initially */}
            <div className=' flex flex-col justify-end h-screen absolute top-0 w-full'>
                <div className='h-[30%] p-6 bg-white relative'>
                    <h5 ref={panelCloseRef} onClick={() => {
                        setPanelOpen(false)
                    }} className='absolute opacity-0 right-6 top-6 text-2xl cursor-pointer'>
                        <i className="ri-arrow-down-wide-line"></i>
                    </h5>
                    <h4 className='text-2xl font-semibold'>Find a trip</h4>
                    <form className='relative py-3' onSubmit={(e) => {
                        submitHandler(e)
                    }}>
                        <div className="line absolute h-16 w-1 top-[50%] -translate-y-1/2 left-5 bg-gray-700 rounded-full"></div>
                        
                        {/* Pickup Input */}
                        <div className='relative'>
                            <i className="ri-record-circle-fill absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-500"></i>
                            <input
                                onClick={() => {
                                    setPanelOpen(true)
                                    setActiveField('pickup')
                                }}
                                value={pickup}
                                onChange={handlePickupChange}
                                className='bg-[#eee] pl-10 pr-4 py-2 text-lg rounded-lg w-full focus:outline-none'
                                type="text"
                                placeholder='Add a pick-up location'
                            />
                        </div>
                        
                        {/* Destination Input */}
                        <div className='relative mt-3'>
                            <i className="ri-map-pin-2-fill absolute left-4 top-1/2 -translate-y-1/2 text-lg text-black"></i>
                            <input
                                onClick={() => {
                                    setPanelOpen(true)
                                    setActiveField('destination')
                                }}
                                value={destination}
                                onChange={handleDestinationChange}
                                className='bg-[#eee] pl-10 pr-4 py-2 text-lg rounded-lg w-full focus:outline-none'
                                type="text"
                                placeholder='Enter your destination' />
                        </div>
                        
                    </form>
                    <button
                        onClick={findTrip}
                        disabled={!pickup || !destination} 
                        className='bg-black text-white px-4 py-2 rounded-lg mt-3 w-full font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-all'>
                        Find Trip
                    </button>
                </div>
                
                {/* Location Search Panel - Slides up to 70% height */}
                <div ref={panelRef} className='bg-white h-0 overflow-scroll'>
                    <LocationSearchPanel
                        suggestions={activeField === 'pickup' ? pickupSuggestions : destinationSuggestions}
                        setPanelOpen={setPanelOpen}
                        setVehiclePanel={setVehiclePanel}
                        setPickup={setPickup}
                        setDestination={setDestination}
                        activeField={activeField}
                    />
                </div>
            </div>
            
            {/* Other Sliding Panels (Z-index is important here) */}
            <div ref={vehiclePanelRef} className='fixed w-full z-20 bottom-0 translate-y-full bg-white px-3 py-10 pt-12 rounded-t-xl shadow-2xl transition-transform duration-500 ease-in-out'>
                <VehiclePanel
                    selectVehicle={setVehicleType}
                    fare={fare} setConfirmRidePanel={setConfirmRidePanel} setVehiclePanel={setVehiclePanel} />
            </div>
            <div ref={confirmRidePanelRef} className='fixed w-full z-30 bottom-0 translate-y-full bg-white px-3 py-6 pt-12 rounded-t-xl shadow-2xl transition-transform duration-500 ease-in-out'>
                <ConfirmRide
                    createRide={createRide}
                    pickup={pickup}
                    destination={destination}
                    fare={fare}
                    vehicleType={vehicleType}
                    setConfirmRidePanel={setConfirmRidePanel} setVehicleFound={setVehicleFound} />
            </div>
            <div ref={vehicleFoundRef} className='fixed w-full z-40 bottom-0 translate-y-full bg-white px-3 py-6 pt-12 rounded-t-xl shadow-2xl transition-transform duration-500 ease-in-out'>
                <LookingForDriver
                    createRide={createRide}
                    pickup={pickup}
                    destination={destination}
                    fare={fare}
                    vehicleType={vehicleType}
                    setVehicleFound={setVehicleFound} />
            </div>
            {/* Using translate-y-full and fixed bottom-0 for controlled animation */}
            <div ref={waitingForDriverRef} className='fixed w-full z-50 bottom-0 translate-y-full bg-white px-3 py-6 pt-12 rounded-t-xl shadow-2xl transition-transform duration-500 ease-in-out'>
                <WaitingForDriver
                    ride={ride}
                    setVehicleFound={setVehicleFound}
                    setWaitingForDriver={setWaitingForDriver}
                    waitingForDriver={waitingForDriver} />
            </div>
        </div>
    )
}

export default Home
