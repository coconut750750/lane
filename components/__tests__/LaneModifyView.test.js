import React from 'react'
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import { Permissions } from 'expo';

import ImageBrowser from 'lane/components/image_picker/ImageBrowser';

import Photo from 'lane/models/Photo';

import LaneModifyView from '../LaneModifyView'

jest.mock('lane/components/image_picker/ImageBrowser', () => 'imagebrowser' );

jest.mock('expo', () => ({
    Permissions: {
        askAsync: jest.fn(),
    }
}));

const mockGoBack = jest.fn( () => {} );
const mockHandleDone = jest.fn( (title, photos, color) => {} );

Enzyme.configure({ adapter: new Adapter() });

describe('LaneModifyView', () => {
    const setup = () => {
        const component = shallow(<LaneModifyView goBack={mockGoBack} handleDone={mockHandleDone}/>);
        const instance = component.instance();
        return { component, instance };
    }

    beforeEach(() => {
        Permissions.askAsync.mockReset();
    });

    it('renders empty create screen correctly', () => {
        const { component, instance } = setup();
        const screen = renderer.create(instance.render()).toJSON();
        const imageBrowser = renderer.create(instance.renderImageBrowser()).toJSON();

        expect(screen).toMatchSnapshot();
        expect(screen).not.toEqual(imageBrowser);
    });

    it('renders top nav correctly', () => {
        const { component, instance } = setup();
        const topNav = renderer.create(instance.renderTopNav()).toJSON();

        expect(topNav).toMatchSnapshot();
    });

    it('renders color modal correctly', () => {
        const { component, instance } = setup();
        const colorModal = renderer.create(instance.renderColorModal()).toJSON();

        expect(colorModal).toMatchSnapshot();
    });

    it('renders image browser if image_browser_open is true in state', () => {
        const { component, instance } = setup();
        const imageBrowser = renderer.create(instance.renderImageBrowser()).toJSON();

        instance.state.imageBrowserOpen = true;
        const screen = renderer.create(instance.render()).toJSON();

        expect(screen).toEqual(imageBrowser);
    });

    it('alerts if permissions throws error', () => {
        Permissions.askAsync.mockImplementation( permission => { throw 'lolol'; } );
        const { component, instance } = setup();

        return instance.handleAddPhotos().then(data => {
            expect(Permissions.askAsync).toHaveBeenCalled();
            expect(instance.state.snackVisible).toBeTruthy();
        });
    });

    it('alerts if permissions returns false', () => {
        Permissions.askAsync.mockImplementation( permission => { return {status: 'error'}; } );
        const { component, instance } = setup();

        return instance.handleAddPhotos().then(data => {
            expect(Permissions.askAsync).toHaveBeenCalled();
            expect(instance.state.snackVisible).toBeTruthy();
        });
    });

    it('opens image browser if permissions returns true', () => {
        Permissions.askAsync.mockImplementation( permission => { return {status: 'granted'}; } );
        const { component, instance } = setup();

        return instance.handleAddPhotos().then( () => {
            expect(Permissions.askAsync).toHaveBeenCalled();
            expect(instance.state.snackVisible).toBeFalsy();
            expect(instance.state.imageBrowserOpen).toBeTruthy();
        });
    });

    it('adds selected photos to state', () => {
        const { component, instance } = setup();

        const photos = [new Photo('uri1', 100, 100, '1', 0), new Photo('uri2', 100, 100, '2', 1)];
        const photoPromise = Promise.all([]).then( () => {
            return photos;
        });

        instance.imageBrowserCallback(photoPromise);
        photoPromise.then( () => {
            expect(instance.state.imageBrowserOpen).toBeFalsy();
            expect(instance.state.photos).toEqual(photos);
        });
    });

    it('adds additional photos to state', () => {
        const { component, instance } = setup();
        const photos = [new Photo('uri1', 100, 100, '1', 0), new Photo('uri2', 100, 100, '2', 1)];
        const photoPromise = Promise.all([]).then( () => {
            return photos;
        });
        instance.imageBrowserCallback(photoPromise);
        instance.imageBrowserCallback(photoPromise);

        photoPromise.then( () => {
            expect(instance.state.imageBrowserOpen).toBeFalsy();
            expect(instance.state.photos).toEqual([...photos, ...photos]);
        });
    });

    it('removes photo from state', () => {
        const { component, instance } = setup();
        const photos = [new Photo('uri1', 100, 100, '1', 0), new Photo('uri2', 100, 100, '2', 1)];
        const photoPromise = Promise.all([]).then( () => {
            return photos;
        });
        instance.imageBrowserCallback(photoPromise);

        photoPromise.then( () => {
            instance.removePhoto('uri1');
            expect(instance.state.photos).toEqual([photos[1]]);
        });
    });

    it('validates no title and no photo lane correctly', () => {
        const { component, instance } = setup();
        expect(instance.validateLane()).toBeFalsy();
    });

    it('validates no title lane correctly', () => {
        const { component, instance } = setup();
        const photos = [new Photo('uri1', 100, 100, '1', 0), new Photo('uri2', 100, 100, '2', 1)];
        instance.state.photos = photos;
        expect(instance.validateLane()).toBeFalsy();
    });

    it('validates no photo lane correctly', () => {
        const { component, instance } = setup();
        instance.state.title = 'title';
        expect(instance.validateLane()).toBeFalsy();
    });

    it('validates a lane longer than a year correctly', () => {
        const { component, instance } = setup();
        const photos = [new Photo('uri1', 100, 100, '1', 0), new Photo('uri2', 100, 100, '2', 31536000)];
        instance.state.title = 'title';
        instance.state.photos = photos;
        expect(instance.validateLane()).toBeFalsy();
    });

    it('validates a lane just less than a year correctly (right edge)', () => {
        const { component, instance } = setup();
        const photos = [new Photo('uri1', 100, 100, '1', 0), new Photo('uri2', 100, 100, '2', 31535999)];
        instance.state.title = 'title';
        instance.state.photos = photos;
        expect(instance.validateLane()).toBeTruthy();
    });

    it('validates a lane just less than a year correctly (left edge)', () => {
        const { component, instance } = setup();
        const photos = [new Photo('uri1', 100, 100, '1', 86400), new Photo('uri2', 100, 100, '2', 31536000)];
        instance.state.title = 'title';
        instance.state.photos = photos;
        expect(instance.validateLane()).toBeTruthy();
    });
});