import React from 'react'
import RegistrationForm from './RegistrationForm';
import StartGame from './StartGame';
import StartNextRound from './StartNextRound';
import ExitGame from './ExitGame';


export default function GameControl({ handlers, actions }) {
    return (
        <div className='gamecontrol'>
            <RegistrationForm handlers={handlers} actions={actions} />
            <StartGame handlers={handlers} actions={actions} />
            <StartNextRound handlers={handlers} actions={actions} />
            <ExitGame handlers={handlers} actions={actions} />
        </div >
    )
}
