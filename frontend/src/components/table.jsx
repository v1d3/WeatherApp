import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import '../styles/user.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWind, faTemperatureThreeQuarters, faPercent ,faCalendarDays} from '@fortawesome/free-solid-svg-icons';

function Table({ weatherData }) {
    return (
        <div style={{ position: 'absolute', top: '69vh', left: '6vw' }}>
            <table className="table table-hover table-sm tabla" style={{ width: '35vw' }}>
                <thead>
                    <tr>
                    <th>
                            Fecha
                            <span style={{ marginLeft: '8px', fontSize: '1em' }}>
                                <FontAwesomeIcon icon={faCalendarDays} color="#5dade2" />
                            </span>
                        </th>
                        <th>
                            Temperatura
                            <span style={{ marginLeft: '8px', fontSize: '1em' }}>
                                <FontAwesomeIcon icon={faTemperatureThreeQuarters} color="#5dade2" />
                            </span>
                        </th>
                        <th>
                            Humedad
                            <span style={{ marginLeft: '8px', fontSize: '1em' }}>
                                <FontAwesomeIcon icon={faPercent} color="#5dade2" />
                            </span>
                        </th>
                        <th>
                            Viento
                            <span style={{ marginLeft: '8px', fontSize: '1em' }}>
                                <FontAwesomeIcon icon={faWind} color="#5dade2" />
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {[0, 1, 2, 3].map((index) => {
                        const item = weatherData[index];
                        return (
                        <tr key={index}>
                            <td style={{ textAlign: 'center' }}>{item ? item.dateTime : 'N/A'}</td>
                            <td style={{ textAlign: 'center' }}>{item ? `${item.temperature}°C` : 'N/A'}</td>
                            <td style={{ textAlign: 'center' }}>{item ? `${item.humidity}%` : 'N/A'}</td>
                            <td style={{ textAlign: 'center' }}>{item ? `${item.windSpeed} km/h` : 'N/A'}</td>
                            </tr>
                         );
                    })}

                </tbody>
            </table>
        </div>
    );
}

export default Table;
