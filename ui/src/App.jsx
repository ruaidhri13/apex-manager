import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
    const [tracks, setTracks] = useState([])

    // This runs when the page loads
    useEffect(() => {
        fetchTracks()
    }, [])

    const fetchTracks = () => {
        // 1. Call the Java API
        axios.get('http://localhost:8080/api/tracks')
            .then(response => {
                // 2. Save the data to React state
                console.log("Data received:", response.data)
                setTracks(response.data)
            })
            .catch(error => {
                console.error("Error fetching tracks:", error)
            })
    }

    return (
        <div className="container">
            <h1>Apex Racing Manager</h1>

            <div className="track-list">
                {tracks.length === 0 ? (
                    <p>Loading tracks...</p>
                ) : (
                    tracks.map(track => (
                        <div key={track.id} className="track-card" style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
                            <h2>{track.name}</h2>
                            <p><strong>Max Karts:</strong> {track.maxKarts}</p>
                            <p><strong>Walk-in Price:</strong> £{track.walkinPrice}</p>
                            <p><strong>Private Rate:</strong> £{track.privateHourlyRatePp} / person</p>
                            <button onClick={() => alert(`Booking logic coming soon for ${track.name}!`)}>
                                Book Now
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default App