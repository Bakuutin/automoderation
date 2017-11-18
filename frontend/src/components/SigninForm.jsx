import React from 'react';
import { Form, Button, Input } from 'reactstrap';
import PropTypes from 'prop-types';

class SigninForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();
        if (this.props.onSubmit) {
            this.props.onSubmit(this.state.value);
        }
    }

    handleChange(event) {
        this.setState({value: event.target.value});
        if (this.props.onChange) {
            this.props.onChange(this.state.value);
        }
    }

    render() {
        return (
            <Form className="form-signin" onSubmit={this.handleSubmit}>
                <h1>{this.props.title}</h1>
                <h3>{this.props.subtitle}</h3>
                <Input placeholder={this.props.placeholder} type="text" value={this.state.value} onChange={this.handleChange} required autoFocus/>
                <Button size="lg" color="primary" block>{this.props.buttonText}</Button>
            </Form>
        );
    }
}

SigninForm.propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
    placeholder: PropTypes.string,
    buttonText: PropTypes.string,
    onSubmit: PropTypes.func,
    onChange: PropTypes.func,
}

export default SigninForm;
