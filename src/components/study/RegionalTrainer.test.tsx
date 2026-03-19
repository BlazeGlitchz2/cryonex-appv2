// @ts-nocheck
import { render } from '@testing-library/react'
import { RegionalTrainer } from './RegionalTrainer'
import { describe, it, expect, vi } from 'vitest'

describe('RegionalTrainer Component', () => {
    it('renders correctly for KSA region', () => {
        const { getByText } = render(<RegionalTrainer region="ksa" curriculum="ksa_moe" onExit={() => { }} />)
        expect(getByText('Qudurat Speed Trainer')).toBeInTheDocument()
        expect(getByText(/Master the GAT/i)).toBeInTheDocument()
    })

    it('renders correctly for Egypt region', () => {
        const { getByText } = render(<RegionalTrainer region="egypt" curriculum="egy_thanaweyya" onExit={() => { }} />)
        expect(getByText('Thanaweyya Challenge')).toBeInTheDocument()
        expect(getByText(/ministry exams/i)).toBeInTheDocument()
    })

    it('starts training when button is clicked', () => {
        const { getByText } = render(<RegionalTrainer region="ksa" curriculum="ksa_moe" onExit={() => { }} />)
        const startButton = getByText('Start Training')
        startButton.click()

        // Check if quiz interface appears
        expect(getByText(/Question 1 \//i)).toBeInTheDocument()
        expect(getByText(/SCORE:/i)).toBeInTheDocument()
    })

    it('calls onExit when back button is clicked', () => {
        const handleExit = vi.fn()
        const { getByText } = render(<RegionalTrainer region="ksa" curriculum="ksa_moe" onExit={handleExit} />)
        const backButton = getByText('Back to Dashboard')
        backButton.click()
        expect(handleExit).toHaveBeenCalledTimes(1)
    })
})
