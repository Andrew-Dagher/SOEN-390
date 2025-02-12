import { render } from '@testing-library/react-native';
import LoginScreen from '../app/screens/login/LoginScreen';

describe('<Login />', () => {
    test('Text renders correctly on Login Screen', () => {
    const { getByTestId } = render(<LoginScreen />);

    const viewComponent = getByTestId("login-screen")

    expect(viewComponent).toBeTruthy(); });
});