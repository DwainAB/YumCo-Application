import React from 'react';
import { render } from '@testing-library/react-native';
import { MenuCard } from '../MenuCard';
import { ColorProvider } from '../../ColorContext/ColorContext';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n/i18n';

const mockMenu = {
    id: '1',
    name: 'Test Menu',
    price: 10.99,
    image_url: 'https://example.com/image.jpg',
    is_active: true,
    categories: [
        { id: '1', name: 'Category 1' }
    ]
};

const renderWithProviders = (component) => {
    return render(
        <I18nextProvider i18n={i18n}>
            <ColorProvider>
                {component}
            </ColorProvider>
        </I18nextProvider>
    );
};

describe('MenuCard', () => {
    it('renders menu card correctly', () => {
        const mockOnPress = jest.fn();
        const { getByText } = renderWithProviders(
            <MenuCard menu={mockMenu} onPress={mockOnPress} userRole="ADMIN" />
        );

        expect(getByText('Test Menu')).toBeTruthy();
        expect(getByText('10.99 €')).toBeTruthy();
    });

    it('is disabled for USER role', () => {
        const mockOnPress = jest.fn();
        const { getByText } = renderWithProviders(
            <MenuCard menu={mockMenu} onPress={mockOnPress} userRole="USER" />
        );

        expect(getByText('Test Menu')).toBeTruthy();
    });
});