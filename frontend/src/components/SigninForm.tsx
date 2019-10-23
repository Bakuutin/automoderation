import * as React from 'react';
import { Form, Button, Input, InputGroup } from 'reactstrap';

export interface Props {
    title: string,
    subtitle: string,
    buttonText: string,
    placeholder: string,
    initial: string,
    errorHand?: string,
    onSubmit: (value: string) => any,
    onChange?: (value: string) => any,
}

export interface State {
    value: string,
}


class SigninForm extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {value: props.initial || ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (this.props.onSubmit) {
            this.props.onSubmit(this.state.value);
        }
    }

    handleChange({target: {value}}: any) {
        this.setState({value});
        if (this.props.onChange) {
            this.props.onChange(this.state.value);
        }
    }

    render() {
        return (
            <Form className="form-signin" onSubmit={this.handleSubmit}>
                <h1>{this.props.title}</h1>
                <h3>{this.props.subtitle}</h3>
                <InputGroup>
                    <Input
                        placeholder={this.props.placeholder}
                        type="text"
                        value={this.state.value}
                        onChange={this.handleChange}
                        required autoFocus
                        valid={this.props.errorHand? false: null}
                        className="rounded"
                        />
                    <div className="invalid-feedback">
                        {this.props.errorHand}
                    </div>
                </InputGroup>
                <Button size="lg" color="primary" block>{this.props.buttonText}</Button>
            </Form>
        );
    }
}

export default SigninForm;
