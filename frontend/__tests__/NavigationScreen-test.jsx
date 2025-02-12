import { render } from '@testing-library/react-native';

import MapCard from '../app/components/navigation/MapCard';

describe('<HomeScreen />', () => {
  test('Text renders correctly on HomeScreen', () => {
    const { getByTestId } = render(<MapCard />);

    const viewComponent = getByTestId("mapcard-view")

    expect(viewComponent).toBeTruthy();  });
});
