// ...
    const { user } = useContext(UserDataContext)

    useEffect(() => {
        if (user?._id && socket) {
            socket.emit("join", { userType: "user", userId: user._id });

            // --- Define listeners inside useEffect ---
            const handleRideConfirmed = (ride) => {
                setVehicleFound(false);
                setWaitingForDriver(true);
                setRide(ride);
            };

            const handleRideStarted = (ride) => {
                setWaitingForDriver(false);
                navigate('/riding', { state: { ride } });
            };

            socket.on('ride-confirmed', handleRideConfirmed);
            socket.on('ride-started', handleRideStarted);

            // --- Cleanup function to prevent memory leaks ---
            return () => {
                socket.off('ride-confirmed', handleRideConfirmed);
                socket.off('ride-started', handleRideStarted);
            };
        }
    }, [user, socket, navigate]); // Add navigate to dependency array
// ...
