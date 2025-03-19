import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider, Portal, Modal } from "react-native-paper";
import { TouchableOpacity } from "react-native";
import CustomizeModal from "../app/screens/Planner/CustomizeModal";  
// Helper to wrap UI with required providers.
const renderWithProviders = (ui, options) =>
  render(
    <SafeAreaProvider>
      <PaperProvider>
        <Portal.Host>{ui}</Portal.Host>
      </PaperProvider>
    </SafeAreaProvider>,
    options
  );

// Helper to combine style objects (if style is an array)
const getCombinedStyle = (style) => {
  return Array.isArray(style) ? Object.assign({}, ...style) : style;
};

describe("CustomizeModal", () => {
  const classes = [{ id: "class1", title: "Math" }];
  const tasks = [{ id: "task1", title: "Homework" }];
  const datePreferences = { class1: { skippable: false }, task1: { important: false } };
  const initialClassColor = "#FFD700";
  const initialTaskColor = "#ADD8E6";

  let onClose, onSavePreferences;
  beforeEach(() => {
    onClose = jest.fn();
    onSavePreferences = jest.fn();
  });

  it("renders correctly when visible", async () => {
    const { queryByText } = renderWithProviders(
      <CustomizeModal
        visible={true}
        onClose={onClose}
        classes={classes}
        toDoTasks={tasks}
        selectedDate="2021-10-10"
        datePreferences={datePreferences}
        initialClassColor={initialClassColor}
        initialTaskColor={initialTaskColor}
        onSavePreferences={onSavePreferences}
      />
    );
    await waitFor(() => {
      expect(queryByText("Customize Planner")).toBeTruthy();
      expect(queryByText("Classes")).toBeTruthy();
      expect(queryByText("To-Do Tasks")).toBeTruthy();
    });
  });

  it('shows "No classes for this day" when classes array is empty', async () => {
    const { queryByText } = renderWithProviders(
      <CustomizeModal
        visible={true}
        onClose={onClose}
        classes={[]}
        toDoTasks={tasks}
        selectedDate="2021-10-10"
        datePreferences={datePreferences}
        initialClassColor={initialClassColor}
        initialTaskColor={initialTaskColor}
        onSavePreferences={onSavePreferences}
      />
    );
    await waitFor(() => {
      expect(queryByText("No classes for this day")).toBeTruthy();
    });
  });

  it('shows "No tasks for this day" when tasks array is empty', async () => {
    const { queryByText } = renderWithProviders(
      <CustomizeModal
        visible={true}
        onClose={onClose}
        classes={classes}
        toDoTasks={[]}
        selectedDate="2021-10-10"
        datePreferences={datePreferences}
        initialClassColor={initialClassColor}
        initialTaskColor={initialTaskColor}
        onSavePreferences={onSavePreferences}
      />
    );
    await waitFor(() => {
      expect(queryByText("No tasks for this day")).toBeTruthy();
    });
  });

  it("toggles section expansion for a class", async () => {
    const { queryByText } = renderWithProviders(
      <CustomizeModal
        visible={true}
        onClose={onClose}
        classes={classes}
        toDoTasks={tasks}
        selectedDate="2021-10-10"
        datePreferences={datePreferences}
        initialClassColor={initialClassColor}
        initialTaskColor={initialTaskColor}
        onSavePreferences={onSavePreferences}
      />
    );
    await waitFor(() => {
      expect(queryByText("Math")).toBeTruthy();
    });
    const mathText = queryByText("Math");
    // Initially, the extra option ("Skippable:") should not be rendered.
    expect(queryByText("Skippable:")).toBeNull();
    fireEvent.press(mathText);
    await waitFor(() => {
      expect(queryByText("Skippable:")).toBeTruthy();
    });
    fireEvent.press(mathText);
    await waitFor(() => {
      expect(queryByText("Skippable:")).toBeNull();
    });
  });

  it("toggles class skippable switch and calls onSavePreferences", async () => {
    const { queryByText, getAllByA11yRole } = renderWithProviders(
      <CustomizeModal
        visible={true}
        onClose={onClose}
        classes={classes}
        toDoTasks={tasks}
        selectedDate="2021-10-10"
        datePreferences={datePreferences}
        initialClassColor={initialClassColor}
        initialTaskColor={initialTaskColor}
        onSavePreferences={onSavePreferences}
      />
    );
    await waitFor(() => {
      expect(queryByText("Math")).toBeTruthy();
    });
    const mathText = queryByText("Math");
    fireEvent.press(mathText);
    await waitFor(() => {
      expect(queryByText("Skippable:")).toBeTruthy();
    });
    // Get all switches; assume the first switch is the class switch.
    const switches = getAllByA11yRole("switch");
    expect(switches.length).toBeGreaterThan(0);
    const classSwitch = switches[0];
    fireEvent(classSwitch, "valueChange", true);
    const saveButton = queryByText("Save Preferences");
    fireEvent.press(saveButton);
    expect(onSavePreferences).toHaveBeenCalledWith(
      { class1: { skippable: true, title: "Math" } },
      initialClassColor,
      initialTaskColor
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("toggles task important switch and calls onSavePreferences", async () => {
    const { queryByText, getAllByA11yRole } = renderWithProviders(
      <CustomizeModal
        visible={true}
        onClose={onClose}
        classes={classes}
        toDoTasks={tasks}
        selectedDate="2021-10-10"
        datePreferences={datePreferences}
        initialClassColor={initialClassColor}
        initialTaskColor={initialTaskColor}
        onSavePreferences={onSavePreferences}
      />
    );
    await waitFor(() => {
      expect(queryByText("Homework")).toBeTruthy();
    });
    const homeworkText = queryByText("Homework");
    fireEvent.press(homeworkText);
    await waitFor(() => {
      expect(queryByText("Important:")).toBeTruthy();
    });
    const switches = getAllByA11yRole("switch");
    // Assume the first (or only) switch in the expanded task section is the task switch.
    const taskSwitch = switches[0];
    fireEvent(taskSwitch, "valueChange", true);
    const saveButton = queryByText("Save Preferences");
    fireEvent.press(saveButton);
    expect(onSavePreferences).toHaveBeenCalledWith(
      { task1: { important: true, title: "Homework" } },
      initialClassColor,
      initialTaskColor
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("updates class color selection", async () => {
    const rendered = renderWithProviders(
      <CustomizeModal
        visible={true}
        onClose={onClose}
        classes={classes}
        toDoTasks={tasks}
        selectedDate="2021-10-10"
        datePreferences={{}}
        initialClassColor={initialClassColor}
        initialTaskColor={initialTaskColor}
        onSavePreferences={onSavePreferences}
      />
    );
    await waitFor(() => {
      // Ensure the color section is rendered by checking for part of its text.
      expect(rendered.queryByText("Class Color:")).toBeTruthy();
    });
    const { UNSAFE_getAllByType } = rendered;
    let touchables = [];
    await waitFor(() => {
      touchables = UNSAFE_getAllByType(TouchableOpacity);
      expect(touchables.length).toBeGreaterThan(0);
    });
    // Find the TouchableOpacity whose combined style has backgroundColor "#FFD6E0"
    const classColorOption = touchables.find((node) => {
      const style = getCombinedStyle(node.props.style);
      return style.backgroundColor === "#FFD6E0";
    });
    expect(classColorOption).toBeTruthy();
    fireEvent.press(classColorOption);
    const saveButton = rendered.queryByText("Save Preferences");
    fireEvent.press(saveButton);
    expect(onSavePreferences).toHaveBeenCalledWith(
      {},
      "#FFD6E0",
      initialTaskColor
    );
  });

  it("updates task color selection", async () => {
    const rendered = renderWithProviders(
      <CustomizeModal
        visible={true}
        onClose={onClose}
        classes={classes}
        toDoTasks={tasks}
        selectedDate="2021-10-10"
        datePreferences={{}}
        initialClassColor={initialClassColor}
        initialTaskColor={initialTaskColor}
        onSavePreferences={onSavePreferences}
      />
    );
    await waitFor(() => {
      expect(rendered.queryByText("To-Do Task Color:")).toBeTruthy();
    });
    const { UNSAFE_getAllByType } = rendered;
    let touchables = [];
    await waitFor(() => {
      touchables = UNSAFE_getAllByType(TouchableOpacity);
      expect(touchables.length).toBeGreaterThan(0);
    });
    const taskColorOption = touchables.find((node) => {
      const style = getCombinedStyle(node.props.style);
      return style.backgroundColor === "#D9F2D9";
    });
    expect(taskColorOption).toBeTruthy();
    fireEvent.press(taskColorOption);
    const saveButton = rendered.queryByText("Save Preferences");
    fireEvent.press(saveButton);
    expect(onSavePreferences).toHaveBeenCalledWith(
      {},
      initialClassColor,
      "#D9F2D9"
    );
  });

  it("calls onClose when modal is dismissed", async () => {
    const rendered = renderWithProviders(
      <CustomizeModal
        visible={true}
        onClose={onClose}
        classes={classes}
        toDoTasks={tasks}
        selectedDate="2021-10-10"
        datePreferences={datePreferences}
        initialClassColor={initialClassColor}
        initialTaskColor={initialTaskColor}
        onSavePreferences={onSavePreferences}
      />
    );
    // Use UNSAFE_getByType to obtain the Modal instance.
    const { UNSAFE_getByType } = rendered;
    const modal = UNSAFE_getByType(Modal);
    fireEvent(modal, "onDismiss");
    expect(onClose).toHaveBeenCalled();
  });

  it("resets local preferences when modal becomes visible", async () => {
    const rendered = renderWithProviders(
      <CustomizeModal
        visible={false}
        onClose={onClose}
        classes={classes}
        toDoTasks={tasks}
        selectedDate="2021-10-10"
        datePreferences={{ class1: { skippable: false } }}
        initialClassColor={initialClassColor}
        initialTaskColor={initialTaskColor}
        onSavePreferences={onSavePreferences}
      />
    );
    // With visible false the modal should not render its content.
    expect(rendered.queryByText("Customize Planner")).toBeNull();
    rendered.rerender(
      <SafeAreaProvider>
        <PaperProvider>
          <Portal.Host>
            <CustomizeModal
              visible={true}
              onClose={onClose}
              classes={classes}
              toDoTasks={tasks}
              selectedDate="2021-10-10"
              datePreferences={{ class1: { skippable: true } }}
              initialClassColor={initialClassColor}
              initialTaskColor={initialTaskColor}
              onSavePreferences={onSavePreferences}
            />
          </Portal.Host>
        </PaperProvider>
      </SafeAreaProvider>
    );
    await waitFor(() => {
      expect(rendered.queryByText("Math")).toBeTruthy();
    });
    const mathText = rendered.queryByText("Math");
    fireEvent.press(mathText);
    const switches = rendered.getAllByA11yRole("switch");
    // The first switch (for the class) should now have value true.
    expect(switches[0].props.value).toBe(true);
  });
});
