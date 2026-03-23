// @ts-nocheck
import { fireEvent, render, screen } from '@testing-library/react'
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
        render(<RegionalTrainer region="ksa" curriculum="ksa_moe" onExit={() => { }} />)
        fireEvent.click(screen.getByText('Start Training'))

        // Check if quiz interface appears
        expect(
            screen.getAllByText((_, element) =>
                element?.textContent?.includes('Question 1 / 2') ?? false
            ).length
        ).toBeGreaterThan(0)
        expect(
            screen.getAllByText((_, element) =>
                element?.textContent?.includes('SCORE: 0') ?? false
            ).length
        ).toBeGreaterThan(0)
    })

    it('calls onExit when back button is clicked', () => {
        const handleExit = vi.fn()
        const { getByText } = render(<RegionalTrainer region="ksa" curriculum="ksa_moe" onExit={handleExit} />)
        const backButton = getByText('Back to Dashboard')
        backButton.click()
        expect(handleExit).toHaveBeenCalledTimes(1)
    })
})
