import React from 'react'
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';

import LoginScreen from '../LoginScreen'
import * as auth from '../../backend/Auth';

jest.mock("../../backend/Auth");

Enzyme.configure({ adapter: new Adapter() });

describe('LoginScreen', () => {
    it('rendering login screen', () => {
        const component = shallow(<LoginScreen />);
        const instance = component.instance();
        instance.state.didAttemptLogin = false;
        const screen = renderer.create(instance.render()).toJSON();
        expect(screen).toMatchSnapshot();
    });

    it('rendering loading screen', () => {
        const component = shallow(<LoginScreen />);
        const instance = component.instance();
        instance.state.didAttemptLogin = true;
        const screen = renderer.create(instance.render()).toJSON();
        expect(screen).toMatchSnapshot();
    });

    it('testing button press function', () => {
        const component = shallow(<LoginScreen />);
        const instance = component.instance();
        expect(instance.state.didAttemptLogin).toBeFalsy();
        instance.attemptSignIn();

        expect(auth.signInWithGoogleAsync).toHaveBeenCalled();
        expect(instance.state.didAttemptLogin).toBeTruthy();
    });
});