"use client";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import { User } from "@/types/user.type";
import { userFormSchema, UserFormValues } from "@/types/schemas/user.schema";
import { createUser, updateUser } from "@/services/user.service";
import { NormalizedError } from "@/types/error.type";
import { applyServerErrors } from "@/utils/applyServerErrors";
import { useNotificationContext } from "@/context/useNotificationContext";

interface UserFormProps {
  item?: User;
  onCancel: () => void;
  onSuccess: () => void;
}

export const UserForm = ({
  item: user,
  onCancel,
  onSuccess,
}: UserFormProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!user;
  const { showNotification } = useNotificationContext();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: user?.email || "",
      username: user?.username || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      role: user?.role || "",
      password: "",
    },
  });

  const mutation = useMutation<unknown, NormalizedError, UserFormValues>({
    mutationFn: (payload) =>
      isEdit && user?.id ? updateUser(user.id, payload) : createUser(payload),
    onSuccess: () => {
      showNotification({
        message: isEdit
          ? "User updated successfully"
          : "User created successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onSuccess();
    },
    onError: (error) => {
      showNotification({
        message: error.message || "Something went wrong!",
        variant: "danger",
      });
      applyServerErrors(error, form.setError);
    },
  });

  // Password is required on create but optional on edit (blank means
  // "keep the current one") — the shared zod schema covers both cases, so
  // this one create-only rule is enforced here instead, right before
  // submitting.
  const onSubmit = form.handleSubmit((data) => {
    if (!isEdit && !data.password) {
      form.setError("password", { message: "Password is required" });
      return;
    }
    mutation.mutate(data);
  });

  return (
    <Form onSubmit={onSubmit}>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              Email <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="email"
              {...form.register("email")}
              isInvalid={!!form.formState.errors.email}
              placeholder="Enter email address"
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.email?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              Username <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              {...form.register("username")}
              isInvalid={!!form.formState.errors.username}
              placeholder="Letters, digits, and @/./+/-/_ only"
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.username?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              {...form.register("first_name")}
              placeholder="Enter first name"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              {...form.register("last_name")}
              placeholder="Enter last name"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Role</Form.Label>
            <Form.Select {...form.register("role")}>
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Operator">Operator</option>
              <option value="User">User</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              Password {!isEdit && <span className="text-danger">*</span>}
            </Form.Label>
            <Form.Control
              type="password"
              {...form.register("password")}
              isInvalid={!!form.formState.errors.password}
              placeholder={
                isEdit
                  ? "Leave blank to keep current password"
                  : "Enter password"
              }
              autoComplete="new-password"
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.password?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex justify-content-end gap-2">
        <Button
          variant="outline-secondary"
          onClick={onCancel}
          disabled={mutation.isPending}
        >
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <div className="d-flex align-items-center justify-content-center gap-1">
              <span>Submitting...</span>
              <Spinner color="white" size="sm" className="me-2" />
            </div>
          ) : isEdit ? (
            "Update User"
          ) : (
            "Create User"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default UserForm;
