import { render, screen, fireEvent } from '@testing-library/react'
import { RegionalTrainer } from './RegionalTrainer'
import { describe, it, expect, vi } from 'vitest'

describe('RegionalTrainer Component', () => {
    it('renders correctly for KSA region', () => {
        render(<RegionalTrainer region="ksa" curriculum="ksa_moe" onExit={() => { }} />)
        expect(screen.getByText('Qudurat Speed Trainer')).toBeInTheDocument()
        expect(screen.getByText(/Master the GAT/i)).toBeInTheDocument()
    })

    it('renders correctly for Egypt region', () => {
        render(<RegionalTrainer region="egypt" curriculum="egy_thanaweyya" onExit={() => { }} />)
        expect(screen.getByText('Thanaweyya Challenge')).toBeInTheDocument()
        expect(screen.getByText(/ministry exams/i)).toBeInTheDocument()
    })

    it('starts training when button is clicked', () => {
        render(<RegionalTrainer region="ksa" curriculum="ksa_moe" onExit={() => { }} />)
        const startButton = screen.getByText('Start Training')
        fireEvent.click(startButton)

        // Check if quiz interface appears
        expect(screen.getByText(/Question 1 \//i)).toBeInTheDocument()
        expect(screen.getByText(/SCORE:/i)).toBeInTheDocument()
    })

    it('calls onExit when back button is clicked', () => {
        const handleExit = vi.fn()
        render(<RegionalTrainer region="ksa" curriculum="ksa_moe" onExit={handleExit} />)
        const backButton = screen.getByText('Back to Dashboard')
        fireEvent.click(backButton)
        expect(handleExit).toHaveBeenCalledTimes(1)
    })
})
