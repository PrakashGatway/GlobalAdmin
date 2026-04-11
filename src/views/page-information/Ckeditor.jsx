import { useEffect, useRef } from "react";

const CKEditorComponent = ({ value, onChange }) => {
    const editorRef = useRef(null);
    const editorInstance = useRef(null);

    useEffect(() => {
        let isMounted = true;

        const initEditor = async () => {
            if (!window.CKEDITOR || !editorRef.current) return;

            try {
                const editor = await window.CKEDITOR.ClassicEditor.create(
                    editorRef.current,
                    {
                        toolbar: [
                            "heading",
                            "|",
                            "bold",
                            "fontSize",
                            "fontFamily",
                            "fontColor",
                            "fontBackgroundColor",
                            "|",
                            "alignment",
                            "|",
                            "italic",
                            "underline",
                            "strikethrough",
                            "link",
                            "|",
                            "code",
                            "bulletedList",
                            "numberedList",
                            "|",
                            "insertTable",
                            "ExportPdf",
                            "ExportWord",
                            "blockQuote",
                            "codeBlock",
                            "|",
                            "undo",
                            "redo",
                            "|",
                            "sourceEditing",
                            "mediaEmbed",
                            "removeFormat",
                            "imageUpload",
                            "imageStyle:full",
                            "imageStyle:side",
                            "imageStyle:alignLeft",
                            "imageStyle:alignRight",
                            "imageStyle:alignCenter"
                        ],
                        link: {
                            addTargetToExternalLinks: true,
                            defaultProtocol: "https://",
                            decorators: {
                                openInNewTab: {
                                    mode: "automatic",
                                    callback: () => true,
                                    attributes: {
                                        target: "_blank",
                                        rel: "noopener noreferrer"
                                    }
                                }
                            }
                        },
                        // ✅ FIX: remove collaboration plugins
                        removePlugins: [
                            // Collaboration
                            "RealTimeCollaborativeComments",
                            "RealTimeCollaborativeTrackChanges",
                            "RealTimeCollaborativeRevisionHistory",
                            "PresenceList",
                            "Comments",
                            "TrackChanges",
                            "TrackChangesData",
                            "RevisionHistory",

                            // Premium / Paid
                            "Pagination",
                            "WProofreader",
                            "DocumentOutline",
                            "TableOfContents",
                            "FormatPainter",
                            "Template",
                            "SlashCommand",
                            "PasteFromOfficeEnhanced",

                            // (Optional safety)
                            // "CaseChange",
                            // "ExportPdf",
                            // "ExportWord",
                            // "ImportWord"
                        ]
                    }
                );

                if (!isMounted) {
                    editor.destroy();
                    return;
                }

                editorInstance.current = editor;

                // ✅ Set initial data
                editor.setData(value || "");

                // ✅ Listen for changes
                editor.model.document.on("change:data", () => {
                    const data = editor.getData();
                    onChange({ target: { value: data } });
                });
            } catch (error) {
                console.error("CKEditor init error:", error);
            }
        };

        initEditor();

        return () => {
            isMounted = false;

            if (editorInstance.current) {
                editorInstance.current.destroy();
                editorInstance.current = null;
            }
        };
    }, []);

    // ✅ Handle external value updates (VERY IMPORTANT)
    useEffect(() => {
        if (editorInstance.current) {
            const currentData = editorInstance.current.getData();

            if (value !== currentData) {
                editorInstance.current.setData(value || "");
            }
        }
    }, [value]);

    return <><button
        type="button"
        onClick={() => {
            const url = prompt("Enter URL (https://...)");
            if (!url) return;

            const editor = editorInstance.current;
            if (!editor) return;

            const selection = editor.model.document.selection;

            editor.model.change(writer => {
                // Apply link to selected text (INLINE)
                for (const range of selection.getRanges()) {
                    writer.setAttribute("linkHref", url, range);
                }
            });
        }}
    >
        🔗 Link
    </button>
        <div ref={editorRef}></div></>;
};

export default CKEditorComponent;