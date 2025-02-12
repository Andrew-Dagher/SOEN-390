import { render } from '@testing-library/react-native';
import SettingsScreen from '../app/screens/settings/settingsScreen';

describe('<Setting />', () => {
    test('Text renders correctly on Settings Screen', () => {
    const { getByTestId } = render(<SettingsScreen />);

    const viewComponent = getByTestId("settings-screen")

    expect(viewComponent).toBeTruthy(); });
});