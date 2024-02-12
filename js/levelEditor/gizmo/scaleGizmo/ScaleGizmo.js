import AxisControl from '../components/AxisControl';
import TranslateGizmo from '../translateGizmo/TranslateGizmo';

export default class ScaleGizmo extends TranslateGizmo {
    createArrow(color) {
        return new AxisControl(color, AxisControl.BOX);
    }
}