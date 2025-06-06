package com.team13.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team13.backend.dto.activity.TagCreationDTO;
import com.team13.backend.dto.activity.TagResponseDTO;
import com.team13.backend.service.TagService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/tag")
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    @GetMapping("")
    public ResponseEntity<List<TagResponseDTO>> getAllTags() {
        return ResponseEntity.ok(tagService.getAllTagResponses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TagResponseDTO> getTagById(@PathVariable Long id) {
        return ResponseEntity.ok(tagService.getTagById(id));
    }

    @PostMapping
    public ResponseEntity<TagResponseDTO> createTag(@Valid @RequestBody TagCreationDTO tag) {
        return new ResponseEntity<>(tagService.saveTag(tag), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TagResponseDTO> updateTag(@PathVariable Long id, @Valid @RequestBody TagCreationDTO tag) {
        return ResponseEntity.ok(tagService.updateTag(tag, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        tagService.deleteTag(id);
        return ResponseEntity.noContent().build();
    }
}