import React from 'react'
import table from '../assets/table.png';

export default function GameTable() {
    return (
        <div className='table'>
            <img className='table__img' src={table} alt="BlackJack table"></img>
        </div>
    )
}
